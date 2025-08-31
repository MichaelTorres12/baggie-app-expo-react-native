declare module '@svg-maps/world' {
  export interface SvgMapLocation {
    id: string;
    name: string;
    path: string;
  }
  export interface SvgMapDefinition {
    label?: string;
    viewBox: string;
    locations: SvgMapLocation[];
  }
  const world: SvgMapDefinition;
  export default world;
}


