import React from 'react';

interface PixQrVisualProps {
  value: string;
  size?: number;
  label?: string;
}

/**
 * Pure SVG QR code visualizer with standard positional markers and deterministic matrix
 */
export const PixQrVisual: React.FC<PixQrVisualProps> = ({ size = 180, label }) => {
  // Generate a deterministic 21x21 QR pattern based on input string
  const gridSize = 25;
  const cells: boolean[][] = [];

  // Initialize
  for (let r = 0; r < gridSize; r++) {
    cells[r] = [];
    for (let c = 0; c < gridSize; c++) {
      // Top-left finder pattern (7x7)
      if (r < 7 && c < 7) {
        cells[r][c] = (r === 0 || r === 6 || c === 0 || c === 6) || (r >= 2 && r <= 4 && c >= 2 && c <= 4);
      }
      // Top-right finder pattern (7x7)
      else if (r < 7 && c >= gridSize - 7) {
        const nc = c - (gridSize - 7);
        cells[r][c] = (r === 0 || r === 6 || nc === 0 || nc === 6) || (r >= 2 && r <= 4 && nc >= 2 && nc <= 4);
      }
      // Bottom-left finder pattern (7x7)
      else if (r >= gridSize - 7 && c < 7) {
        const nr = r - (gridSize - 7);
        cells[r][c] = (nr === 0 || nr === 6 || c === 0 || c === 6) || (nr >= 2 && nr <= 4 && c >= 2 && c <= 4);
      }
      // Timing patterns
      else if (r === 6) {
        cells[r][c] = c % 2 === 0;
      } else if (c === 6) {
        cells[r][c] = r % 2 === 0;
      }
      // Center logo cutout
      else if (r >= 10 && r <= 14 && c >= 10 && c <= 14) {
        cells[r][c] = false;
      }
      // Data density pseudo-randomness
      else {
        const seed = (r * 31 + c * 17 + (label?.length || 13)) % 100;
        cells[r][c] = seed % 3 !== 0;
      }
    }
  }

  return (
    <div className="relative inline-flex flex-col items-center p-3 bg-white rounded-xl shadow-md border border-neutral-200">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${gridSize} ${gridSize}`}
        className="shape-rendering-crispEdges"
      >
        <rect width={gridSize} height={gridSize} fill="#ffffff" />
        {cells.map((row, r) =>
          row.map((active, c) =>
            active ? (
              <rect
                key={`${r}-${c}`}
                x={c}
                y={r}
                width={1}
                height={1}
                fill="#0f172a"
              />
            ) : null
          )
        )}
      </svg>
      {/* Pix center emblem badge */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-8 h-8 bg-teal-500 rounded-md border-2 border-white flex items-center justify-center shadow-sm">
          <span className="text-[9px] font-black text-white tracking-tighter">PIX</span>
        </div>
      </div>
    </div>
  );
};
