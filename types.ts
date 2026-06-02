
export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface PathSegment {
  start: Vector3;
  end: Vector3;
  width: number;
  height: number;
  flowRate: number;
  layerKey: string;
}

export interface ObjectInfo {
  ObjectName: string;
  ObjectVersion: string;
  ProjectName: string;
  Designer: string;
  ExportDate: string;
  ExportTime: string;
}

export interface MetadataRange {
  min: number;
  max: number;
}

export interface ToolpathData {
  objectInfo: ObjectInfo;
  segments: PathSegment[];
  maxBounds: Vector3;
  minBounds: Vector3;
  totalVolume: number;
  totalPrintingTime: number;
  units: Record<string, string>;
  layerKeys: string[];
  ranges: {
    width: MetadataRange;
    height: MetadataRange;
    flowRate: MetadataRange;
  };
}

export type ColorMode = 'none' | 'width' | 'height' | 'flowRate';
