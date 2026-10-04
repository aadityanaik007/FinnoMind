"use client";
import { getBezierPath, EdgeLabelRenderer } from "reactflow";

const CountEdge = ({
  id, sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition, data, style = {},
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
  });

  const count = data?.count;

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        style={{
          stroke: "rgba(148,163,184,0.35)",
          strokeWidth: 2,
          ...style,
        }}
      />
      {count != null && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              background: count > 0 ? "rgba(16,185,129,0.2)" : "rgba(148,163,184,0.15)",
              color: count > 0 ? "#34d399" : "#64748b",
              border: `1px solid ${count > 0 ? "rgba(16,185,129,0.4)" : "rgba(148,163,184,0.25)"}`,
              padding: "2px 8px",
              borderRadius: "10px",
              fontSize: "11px",
              fontWeight: 700,
              pointerEvents: "none",
            }}
          >
            {count}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

export default CountEdge;
