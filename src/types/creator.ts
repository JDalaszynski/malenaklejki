export interface PlacedSticker {
  id: string;
  imageUrl: string;
  x: number; // in mm
  y: number; // in mm
  widthCm: number; // in cm
  heightCm: number; // in cm
  aspectRatio: number; // width / height
  cutLineType: "none" | "contour" | "rounded" | "circle" | "contour_inside" | "rounded_inside" | "circle_inside";
  rotation?: number; // in degrees (0 - 360)
  contourPolygons?: { x: number; y: number }[][];
}
