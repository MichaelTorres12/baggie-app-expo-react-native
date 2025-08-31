import React, { useMemo, useRef, useState } from 'react';
import { Alert, Animated, Dimensions, FlatList, PanResponder, Pressable, StyleSheet, Text, TextInput, View, Image } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import World from '@svg-maps/world';

// TODO: Replace with real user data persisted in storage or backend
const initialVisited = ['US', 'CA', 'MX'];

const { width } = Dimensions.get('window');
const mapHeight = width * 0.6;

type City = { id: string; name: string; countryId?: string };
type CountryPhoto = { id: string; uri: string; x: number; y: number; countryId: string };

function getFlagEmojiFromCountryCode(code: string): string {
  const upper = code.toUpperCase();
  if (upper.length !== 2) return '🏳️';
  const A = 127462; // 0x1F1E6
  const first = upper.codePointAt(0);
  const second = upper.codePointAt(1);
  if (!first || !second) return '🏳️';
  return String.fromCodePoint(A + (first - 65)) + String.fromCodePoint(A + (second - 65));
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export default function VisitedMapScreen() {
  const world = World;

  // Visited countries state
  const [visited, setVisited] = useState<Set<string>>(new Set(initialVisited.map((c) => c.toLowerCase())));

  // Cities state
  const [cities, setCities] = useState<City[]>([]);
  const [cityText, setCityText] = useState<string>('');
  // Photos per country
  const [photos, setPhotos] = useState<Record<string, CountryPhoto[]>>({});

  // Progress mode (# or %)
  const [progressMode, setProgressMode] = useState<'#' | '%'>('#');

  // Derived values
  const totalCountries = world.locations.length;
  const visitedCount = useMemo(() => (
    world.locations.reduce((count: number, country) => (visited.has(country.id) ? count + 1 : count), 0)
  ), [visited, world.locations]);
  const percentage = ((visitedCount / totalCountries) * 100).toFixed(0);

  // Zoom and pan
  const MAX_SCALE = 20;
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const lastScaleRef = useRef(1);
  const lastOffset = useRef({ x: 0, y: 0 });
  const pinchRef = useRef({ active: false, distance: 0, startScale: 1 });
  const [isMapGestureActive, setIsMapGestureActive] = useState<boolean>(false);
  const AnimatedG = useMemo(() => Animated.createAnimatedComponent(G), []);
  const [activeTab, setActiveTab] = useState<'countries' | 'photos'>('countries');

  function setScale(next: number) {
    const clamped = clamp(next, 1, MAX_SCALE);
    lastScaleRef.current = clamped;
    Animated.timing(scale, { toValue: clamped, duration: 150, useNativeDriver: true }).start();
    if (clamped === 1) {
      lastOffset.current = { x: 0, y: 0 };
      translateX.setValue(0);
      translateY.setValue(0);
    }
  }

  function zoomIn() {
    setScale(lastScaleRef.current + 0.5);
  }

  function zoomOut() {
    setScale(lastScaleRef.current - 0.5);
  }

  function distance(touches: readonly any[]): number {
    const [a, b] = touches as any[];
    const dx = a.pageX - b.pageX;
    const dy = a.pageY - b.pageY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderGrant: (evt) => {
        setIsMapGestureActive(true);
        if (evt.nativeEvent.touches.length >= 2) {
          pinchRef.current.active = true;
          pinchRef.current.distance = distance(evt.nativeEvent.touches);
          pinchRef.current.startScale = lastScaleRef.current;
        } else {
          pinchRef.current.active = false;
        }
      },
      onPanResponderMove: (evt, gestureState) => {
        if (evt.nativeEvent.touches.length >= 2 && pinchRef.current.active) {
          const newDist = distance(evt.nativeEvent.touches);
          const ratio = newDist / Math.max(1, pinchRef.current.distance);
          const next = clamp(pinchRef.current.startScale * ratio, 1, MAX_SCALE);
          scale.setValue(next);
        } else if (lastScaleRef.current > 1) {
          const nx = lastOffset.current.x + gestureState.dx;
          const ny = lastOffset.current.y + gestureState.dy;
          translateX.setValue(nx);
          translateY.setValue(ny);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (pinchRef.current.active) {
          lastScaleRef.current = (scale as any)._value || lastScaleRef.current;
          pinchRef.current.active = false;
        } else if (lastScaleRef.current > 1) {
          lastOffset.current = {
            x: lastOffset.current.x + gestureState.dx,
            y: lastOffset.current.y + gestureState.dy,
          };
        }
        setIsMapGestureActive(false);
      },
      onPanResponderTerminate: () => {
        setIsMapGestureActive(false);
      },
      onPanResponderTerminationRequest: () => true,
    })
  ).current;

  function toggleCountry(id: string) {
    setVisited((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    Alert.alert('Todo bien', `País ${id.toUpperCase()} actualizado ✅`);
  }

  async function addPhotoForCountry(countryId: string) {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== 'granted') {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tus fotos para agregar una imagen.');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.9 });
    if (res.canceled || !res.assets?.length) return;
    const uri = res.assets[0].uri;
    // Place at center of viewBox as a starting point; future: compute centroid per country
    const cx = 505; // 0..1010 midpoint
    const cy = 333; // 0..666 midpoint
    const photo: CountryPhoto = { id: `${Date.now()}`, uri, x: cx, y: cy, countryId };
    setPhotos((prev) => ({ ...prev, [countryId]: [photo, ...(prev[countryId] || [])] }));
    setVisited((prev) => new Set(prev).add(countryId));
  }

  function addCity() {
    const name = cityText.trim();
    if (!name) return;
    const newCity: City = { id: `${Date.now()}`, name };
    setCities((prev) => [newCity, ...prev]);
    setCityText('');
    Alert.alert('Todo bien', `Ciudad "${name}" agregada ✅`);
  }

  const sortedCountries = useMemo(() => (
    [...world.locations].sort((a, b) => a.name.localeCompare(b.name))
  ), [world.locations]);

  const photoUriByCountry: Record<string, string> = useMemo(() => {
    const mapping: Record<string, string> = {};
    Object.keys(photos).forEach((cid) => {
      const first = photos[cid]?.[0];
      if (first?.uri) mapping[cid] = first.uri;
    });
    return mapping;
  }, [photos]);

  const [preview, setPreview] = useState<{ uri: string; country: string } | null>(null);
  const photoItems = useMemo(() => (
    Object.entries(photos).flatMap(([cid, arr]) => arr.map((p) => ({ id: p.id, uri: p.uri, countryId: cid, countryName: (world.locations.find((l) => l.id === cid)?.name) || cid.toUpperCase() })))
  ), [photos, world.locations]);
  const tileSize = Math.floor((width - 16 * 2 - 8 * 2) / 3);

  return (
    <FlatList
      data={sortedCountries}
      keyExtractor={(item) => item.id}
      scrollEnabled={!isMapGestureActive}
      ListHeaderComponent={(
        <View>
          <View style={styles.headerBackground} />
          <View style={styles.mapCard}>
            <Animated.View
              style={{ transform: [{ translateX }, { translateY }, { scale }] }}
              {...panResponder.panHandlers}
            >
              <Svg width={width} height={mapHeight} viewBox={world.viewBox}>
                <AnimatedG>
                  {world.locations.map((country) => (
                    <Path
                      key={country.id}
                      d={country.path}
                      fill={visited.has(country.id) ? '#FFB300' : '#ECEFF1'}
                      stroke="#FFFFFF"
                      strokeWidth={0.5}
                      onPress={() => toggleCountry(country.id)}
                    />
                  ))}
                </AnimatedG>
              </Svg>
            </Animated.View>
            <View style={styles.zoomControls} pointerEvents="box-none">
              <View style={styles.zoomBox}>
                <Pressable onPress={zoomIn} style={styles.zoomButton}>
                  <Text style={styles.zoomLabel}>+</Text>
                </Pressable>
                <View style={styles.zoomDivider} />
                <Pressable onPress={zoomOut} style={styles.zoomButton}>
                  <Text style={styles.zoomLabel}>-</Text>
                </Pressable>
              </View>
            </View>
            
          </View>
          <View style={styles.progressCard}>
              <View style={styles.progressHeaderRow}>
                <Text style={styles.progressTitle}>YOUR PROGRESS</Text>
                <View style={styles.segment}>
                  <Pressable style={[styles.segmentItem, progressMode === '#' && styles.segmentItemActive]} onPress={() => setProgressMode('#')}>
                    <Text style={[styles.segmentText, progressMode === '#' && styles.segmentTextActive]}>#</Text>
                  </Pressable>
                  <Pressable style={[styles.segmentItem, progressMode === '%' && styles.segmentItemActive]} onPress={() => setProgressMode('%')}>
                    <Text style={[styles.segmentText, progressMode === '%' && styles.segmentTextActive]}>%</Text>
                  </Pressable>
                </View>
              </View>
              <View style={styles.progressRow}>
                <View style={styles.progressCell}>
                  <Text style={styles.progressNumber}>{visitedCount}</Text>
                  <Text style={styles.progressLabel}>COUNTRIES</Text>
                </View>
                <View style={styles.progressCell}>
                  <Text style={styles.progressNumber}>{progressMode === '#' ? visitedCount : percentage}</Text>
                  <Text style={styles.progressLabel}>{progressMode === '#' ? 'TOTAL' : 'PERCENT'}</Text>
                </View>
              </View>
              <View style={styles.progressBarWrap}>
                <View style={[styles.progressBarFill, { width: `${(visitedCount / totalCountries) * 100}%` }]} />
              </View>
            </View>
          <View style={styles.tabsRow}>
            <Pressable onPress={() => setActiveTab('countries')} style={[styles.tabItem, activeTab === 'countries' && styles.tabItemActive]}>
              <Text style={[styles.tabText, activeTab === 'countries' && styles.tabTextActive]}>Countries</Text>
            </Pressable>
            <Pressable onPress={() => setActiveTab('photos')} style={[styles.tabItem, activeTab === 'photos' && styles.tabItemActive]}>
              <Text style={[styles.tabText, activeTab === 'photos' && styles.tabTextActive]}>Photos</Text>
            </Pressable>
          </View>
          {activeTab === 'countries' && (
            <Text style={styles.sectionTitle}>COUNTRIES</Text>
          )}
        </View>
      )}
      renderItem={({ item }) => {
        const checked = visited.has(item.id);
        if (activeTab === 'photos') return null as any;
        return (
          <View style={styles.countryRow}>
            <Pressable onPress={() => toggleCountry(item.id)} style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <Text style={styles.checkbox}>{checked ? '☑️' : '⬜'}</Text>
              <Text style={styles.flag}>{getFlagEmojiFromCountryCode(item.id)}</Text>
              <Text style={styles.countryName}>{item.name}</Text>
            </Pressable>
            <Pressable onPress={() => addPhotoForCountry(item.id)} style={styles.photoButton}>
              <Text style={styles.photoButtonText}>{photoUriByCountry[item.id] ? 'Cambiar foto' : 'Agregar foto'}</Text>
            </Pressable>
            {photoUriByCountry[item.id] && (
              <Pressable onPress={() => setPreview({ uri: photoUriByCountry[item.id], country: item.name })} style={styles.thumbWrap}>
                <View style={styles.thumbDot} />
              </Pressable>
            )}
          </View>
        );
      }}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      ListFooterComponent={(
        <View>
          {activeTab === 'countries' ? (
            <Text style={styles.sectionTitle}>CITIES</Text>
          ) : (
            <>
              <Text style={styles.sectionTitle}>PHOTOS</Text>
              <View style={styles.photoGrid}>
                {photoItems.map((ph) => (
                  <Pressable key={ph.id} onPress={() => setPreview({ uri: ph.uri, country: ph.countryName })} style={[styles.photoTile, { width: tileSize, height: tileSize }] }>
                    <Image source={{ uri: ph.uri }} style={styles.photoTileImg} />
                  </Pressable>
                ))}
              </View>
            </>
          )}
          <View style={styles.cityInputRow}>
            <TextInput
              placeholder="Add a city (e.g., Madrid)"
              value={cityText}
              onChangeText={setCityText}
              style={styles.cityInput}
            />
            <Pressable style={styles.addButton} onPress={addCity}>
              <Text style={styles.addButtonText}>ADD</Text>
            </Pressable>
          </View>
          {cities.map((c) => (
            <View key={c.id} style={styles.cityRow}>
              <Text style={styles.cityName}>{c.name}</Text>
            </View>
          ))}
          <View style={{ height: 24 }} />
          {preview && (
            <View style={styles.modalBackdrop}>
              <Pressable style={styles.modalBackdropTouchable} onPress={() => setPreview(null)} />
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>{preview.country}</Text>
                <View style={styles.modalImageWrap}>
                  <Image source={{ uri: preview.uri }} style={{ flex: 1, width: '100%', height: '100%', resizeMode: 'contain' }} />
                </View>
                <View style={styles.modalActions}>
                  <Pressable style={styles.modalButton} onPress={() => setPreview(null)}>
                    <Text style={styles.modalButtonText}>Cerrar</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          )}
        </View>
      )}
      contentContainerStyle={styles.listContent}
    />
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 40,
    backgroundColor: '#f1f3f4',
  },
  mapCard: {
    backgroundColor: '#fff',
    padding: 10,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    height: mapHeight + 20,
    shadowRadius: 6,
    elevation: 2,
  },
  progressCard: {
    backgroundColor: '#fff',
    marginTop: 12,
    borderRadius: 12,
    padding: 16,
    borderColor: '#e0e0e0',
    borderWidth: 1,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: '#eee',
    borderRadius: 8,
    overflow: 'hidden',
  },
  segmentItem: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  segmentItemActive: {
    backgroundColor: '#555',
  },
  segmentText: {
    color: '#333',
    fontWeight: 'bold',
  },
  segmentTextActive: {
    color: '#fff',
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  progressCell: {
    alignItems: 'center',
    flex: 1,
  },
  progressNumber: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  progressLabel: {
    color: '#666',
    marginTop: 2,
    fontSize: 12,
  },
  progressBarWrap: {
    marginTop: 10,
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#26a69a',
  },
  headerBackground: {
    height: 4,
    backgroundColor: '#f1f3f4',
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  listContent: {
    backgroundColor: '#fff',
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
    marginLeft: 16,
  },
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  checkbox: {
    width: 26,
    textAlign: 'center',
    marginRight: 8,
  },
  flag: {
    width: 28,
    textAlign: 'center',
    marginRight: 10,
    fontSize: 16,
  },
  countryName: {
    fontSize: 15,
    color: '#222',
  },
  photoButton: {
    backgroundColor: '#e8f0fe',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  photoButtonText: {
    color: '#1a73e8',
    fontWeight: 'bold',
  },
  thumbWrap: {
    marginLeft: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#e0f2f1',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#26a69a',
    borderWidth: 1,
  },
  thumbDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#26a69a',
  },
  modalBackdrop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBackdropTouchable: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  modalCard: {
    width: '88%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalImageWrap: {
    height: 320,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  modalActions: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#1a73e8',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 8,
  },
  tabItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#eee',
    marginRight: 8,
  },
  tabItemActive: {
    backgroundColor: '#1a73e8',
  },
  tabText: {
    color: '#333',
    fontWeight: 'bold',
  },
  tabTextActive: {
    color: '#fff',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  photoTile: {
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#ddd',
  },
  photoTileImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  zoomControls: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  zoomBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    borderColor: '#ddd',
    borderWidth: 1,
  },
  zoomButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomLabel: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  zoomDivider: {
    height: 1,
    backgroundColor: '#eee',
  },
  photoMiniBtn: {
    backgroundColor: '#f1f3f4',
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  photoMiniText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  cityInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 8,
  },
  cityInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  addButton: {
    backgroundColor: '#FFB300',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    fontWeight: 'bold',
    color: '#333',
  },
  cityRow: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cityName: {
    fontSize: 15,
  },
});
