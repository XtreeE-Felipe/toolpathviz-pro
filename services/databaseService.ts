
import { DatabaseItem } from '../types';

// We'll import the provided JSON as the primary entry in our database
const FieldsColumnData = {
  "ObjectInfo": {
    "ObjectName": "FieldsColumn",
    "ObjectVersion": "2",
    "Designer": "LFP",
    "ExportDate": "03/17/2025"
  },
  "Units": {
    "VolumeUnit": "L",
    "PrintingTimeUnit": "min"
  },
  "AnalysisData": {
    "Volume": "69.01",
    "PrintingTime": "31.81"
  },
  "Toolpath": {
    "{0}": {
      "Positions": ["-94.4,-119.7,7.2", "-127.7,-96.0,7.3", "-156.1,-68.2,7.3", "-196.8,-67.4,7.3", "-234.5,-53.1,7.4", "-244.6,-23.3,7.4"],
      "LayerWidths": ["30.0", "30.0", "30.0", "30.0", "30.0", "30.0"],
      "LayerHeights": ["7.2", "7.2", "7.3", "7.3", "7.4", "7.4"],
      "MaterialFlowRates": ["2.3", "2.5", "2.6", "2.6", "2.7", "2.8"]
    },
    "{1}": {
      "Positions": ["-100.6,-126.6,14.4", "-122.0,-92.2,14.5", "-156.9,-75.6,14.6", "-195.4,-65.2,14.7"],
      "LayerWidths": ["30.1", "30.0", "30.9", "31.7"],
      "LayerHeights": ["7.2", "7.2", "7.3", "7.3"],
      "MaterialFlowRates": ["2.3", "2.5", "2.6", "2.6"]
    }
  }
};

const SimpleTestPattern = {
  "ObjectInfo": {
    "ObjectName": "CalibrationSquare",
    "ObjectVersion": "1",
    "Designer": "System",
    "ExportDate": "03/18/2025"
  },
  "Units": {
    "VolumeUnit": "L",
    "PrintingTimeUnit": "min"
  },
  "AnalysisData": {
    "Volume": "5.2",
    "PrintingTime": "12.0"
  },
  "Toolpath": {
    "{0}": {
      "Positions": ["0,0,10", "1000,0,10", "1000,1000,10", "0,1000,10", "0,0,10"],
      "LayerWidths": ["35", "35", "35", "35", "35"],
      "LayerHeights": ["10", "10", "10", "10", "10"],
      "MaterialFlowRates": ["1.5", "1.5", "1.5", "1.5", "1.5"]
    },
    "{1}": {
      "Positions": ["0,0,20", "1000,0,20", "1000,1000,20", "0,1000,20", "0,0,20"],
      "LayerWidths": ["35", "35", "35", "35", "35"],
      "LayerHeights": ["10", "10", "10", "10", "10"],
      "MaterialFlowRates": ["2.5", "2.5", "2.5", "2.5", "2.5"]
    }
  }
};

export const toolpathDatabase: DatabaseItem[] = [
  {
    id: 'fields-column',
    name: 'Fields Column v2',
    description: 'Complex architectural column structure.',
    data: FieldsColumnData
  },
  {
    id: 'calib-square',
    name: 'Calibration Cube',
    description: '1000x1000mm calibration structure.',
    data: SimpleTestPattern
  }
];
