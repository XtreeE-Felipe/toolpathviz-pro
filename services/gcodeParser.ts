
import { PathSegment, ToolpathData, Vector3, ObjectInfo, MetadataRange } from '../types';

export const parseToolpathJson = (json: any): ToolpathData => {
  const segments: PathSegment[] = [];
  let minBounds: Vector3 = { x: Infinity, y: Infinity, z: Infinity };
  let maxBounds: Vector3 = { x: -Infinity, y: -Infinity, z: -Infinity };

  let widthRange: MetadataRange = { min: Infinity, max: -Infinity };
  let heightRange: MetadataRange = { min: Infinity, max: -Infinity };
  let flowRange: MetadataRange = { min: Infinity, max: -Infinity };

  // Extract constant values from ToolpathDataRange if present
  const toolpathDataRange = json.ToolpathDataRange || {};
  
  const getToolpathDataRangeValue = (possibleKeys: string[]): number => {
    for (const key of possibleKeys) {
      if (toolpathDataRange[key] !== undefined && toolpathDataRange[key] !== null) {
        const parsedVal = parseFloat(toolpathDataRange[key]);
        if (!isNaN(parsedVal)) return parsedVal;
      }
    }
    return 0;
  };

  const defaultWidth = getToolpathDataRangeValue(['LayerWidth', 'LayerWidths', 'Width', 'width']);
  const defaultHeight = getToolpathDataRangeValue(['LayerHeight', 'LayerHeights', 'Height', 'height']);
  const defaultFlowRate = getToolpathDataRangeValue(['MaterialFlowRate', 'MaterialFlowRates', 'FlowRate', 'flowRate', 'Flow', 'flow']);

  const toolpath = json.Toolpath || {};
  const layerKeys = Object.keys(toolpath).sort((a, b) => {
    const numA = parseInt(a.replace(/[{}]/g, ''));
    const numB = parseInt(b.replace(/[{}]/g, ''));
    return numA - numB;
  });

  layerKeys.forEach((layerKey) => {
    const layer = toolpath[layerKey];
    const positions = layer.Positions || [];
    const widths = layer.LayerWidths || [];
    const heights = layer.LayerHeights || [];
    const flowRates = layer.MaterialFlowRates || [];

    for (let i = 0; i < positions.length - 1; i++) {
      const startParts = positions[i].split(',').map(Number);
      const endParts = positions[i + 1].split(',').map(Number);

      const start: Vector3 = { x: startParts[0], y: startParts[1], z: startParts[2] };
      const end: Vector3 = { x: endParts[0], y: endParts[1], z: endParts[2] };

      let w = widths[i] !== undefined ? parseFloat(widths[i]) : NaN;
      if (isNaN(w) || w === 0) w = defaultWidth;

      let h = heights[i] !== undefined ? parseFloat(heights[i]) : NaN;
      if (isNaN(h) || h === 0) h = defaultHeight;

      let f = flowRates[i] !== undefined ? parseFloat(flowRates[i]) : NaN;
      if (isNaN(f) || f === 0) f = defaultFlowRate;

      // Update ranges
      if (w < widthRange.min) widthRange.min = w;
      if (w > widthRange.max) widthRange.max = w;
      if (h < heightRange.min) heightRange.min = h;
      if (h > heightRange.max) heightRange.max = h;
      if (f < flowRange.min) flowRange.min = f;
      if (f > flowRange.max) flowRange.max = f;

      // Update bounds
      [start, end].forEach(p => {
        minBounds.x = Math.min(minBounds.x, p.x);
        minBounds.y = Math.min(minBounds.y, p.y);
        minBounds.z = Math.min(minBounds.z, p.z);
        maxBounds.x = Math.max(maxBounds.x, p.x);
        maxBounds.y = Math.max(maxBounds.y, p.y);
        maxBounds.z = Math.max(maxBounds.z, p.z);
      });

      segments.push({
        start,
        end,
        width: w,
        height: h,
        flowRate: f,
        layerKey
      });
    }
  });

  // Handle case where no segments are found or range min remains Infinity
  const fallbackWidth = defaultWidth > 0 ? { min: defaultWidth, max: defaultWidth } : { min: 0, max: 1 };
  const fallbackHeight = defaultHeight > 0 ? { min: defaultHeight, max: defaultHeight } : { min: 0, max: 1 };
  const fallbackFlowRate = defaultFlowRate > 0 ? { min: defaultFlowRate, max: defaultFlowRate } : { min: 0, max: 1 };

  return {
    objectInfo: json.ObjectInfo as ObjectInfo,
    segments,
    minBounds: minBounds.x === Infinity ? { x: 0, y: 0, z: 0 } : minBounds,
    maxBounds: maxBounds.x === -Infinity ? { x: 0, y: 0, z: 0 } : maxBounds,
    totalVolume: parseFloat(json.AnalysisData?.Volume || '0'),
    totalPrintingTime: parseFloat(json.AnalysisData?.PrintingTime || '0'),
    units: json.Units || {},
    layerKeys,
    ranges: {
      width: widthRange.min === Infinity ? fallbackWidth : widthRange,
      height: heightRange.min === Infinity ? fallbackHeight : heightRange,
      flowRate: flowRange.min === Infinity ? fallbackFlowRate : flowRange,
    }
  };
};
