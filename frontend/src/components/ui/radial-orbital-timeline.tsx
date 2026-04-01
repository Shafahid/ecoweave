"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ElementType, MouseEvent } from "react";
import { ArrowRight, Link as LinkIcon, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface TimelineItem {
  id: number;
  title: string;
  date: string;
  content: string;
  category: string;
  icon: ElementType;
  relatedIds: number[];
  status: "completed" | "in-progress" | "pending";
  energy: number;
}

interface RadialOrbitalTimelineProps {
  timelineData: TimelineItem[];
  className?: string;
}

export default function RadialOrbitalTimeline({
  timelineData,
  className,
}: RadialOrbitalTimelineProps) {
  const initialNodeId = timelineData[0]?.id ?? null;

  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>(
    initialNodeId ? { [initialNodeId]: true } : {}
  );
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [pulseEffect, setPulseEffect] = useState<Record<number, boolean>>(
    initialNodeId ? { [initialNodeId]: true } : {}
  );
  const [activeNodeId, setActiveNodeId] = useState<number | null>(initialNodeId);
  const [radius, setRadius] = useState<number>(220);

  const containerRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const handleContainerClick = (e: MouseEvent<HTMLDivElement>) => {
    const firstNodeId = timelineData[0]?.id;
    if (e.target === e.currentTarget || e.target === orbitRef.current) {
      if (firstNodeId) {
        setExpandedItems({ [firstNodeId]: true });
        setActiveNodeId(firstNodeId);
        setPulseEffect({ [firstNodeId]: true });
        setAutoRotate(false);
      }
    }
  };

  const getRelatedItems = (itemId: number): number[] => {
    const currentItem = timelineData.find((item) => item.id === itemId);
    return currentItem ? currentItem.relatedIds : [];
  };

  const isRelatedToActive = (itemId: number): boolean => {
    if (!activeNodeId) return false;
    return getRelatedItems(activeNodeId).includes(itemId);
  };

  const centerViewOnNode = (nodeId: number) => {
    if (!nodeRefs.current[nodeId] || timelineData.length === 0) return;

    const nodeIndex = timelineData.findIndex((item) => item.id === nodeId);
    const targetAngle = (nodeIndex / timelineData.length) * 360;
    setRotationAngle(270 - targetAngle);
  };

  const toggleItem = (id: number) => {
    setExpandedItems(() => {
      const next: Record<number, boolean> = { [id]: true };
      setActiveNodeId(id);
      setAutoRotate(false);
      centerViewOnNode(id);

      const relatedItems = getRelatedItems(id);
      const nextPulse: Record<number, boolean> = { [id]: true };
      relatedItems.forEach((relatedId) => {
        nextPulse[relatedId] = true;
      });
      setPulseEffect(nextPulse);

      return next;
    });
  };

  useEffect(() => {
    if (!timelineData.length) return;

    const activeExists =
      activeNodeId !== null &&
      timelineData.some((item) => item.id === activeNodeId);

    if (!activeExists) {
      const firstNodeId = timelineData[0].id;
      setExpandedItems({ [firstNodeId]: true });
      setActiveNodeId(firstNodeId);
      setPulseEffect({ [firstNodeId]: true });
      setAutoRotate(false);
    }
  }, [timelineData, activeNodeId]);

  useEffect(() => {
    const updateRadius = () => {
      const width = containerRef.current?.clientWidth ?? window.innerWidth;
      if (width < 640) {
        setRadius(120);
      } else if (width < 1024) {
        setRadius(170);
      } else {
        setRadius(220);
      }
    };

    updateRadius();
    window.addEventListener("resize", updateRadius);
    return () => window.removeEventListener("resize", updateRadius);
  }, []);

  useEffect(() => {
    let rotationTimer: ReturnType<typeof setInterval> | undefined;

    if (autoRotate) {
      rotationTimer = setInterval(() => {
        setRotationAngle((prev) => Number(((prev + 0.3) % 360).toFixed(3)));
      }, 50);
    }

    return () => {
      if (rotationTimer) {
        clearInterval(rotationTimer);
      }
    };
  }, [autoRotate]);

  const calculateNodePosition = (index: number, total: number) => {
    const angle = ((index / total) * 360 + rotationAngle) % 360;
    const radian = (angle * Math.PI) / 180;

    const x = radius * Math.cos(radian);
    const y = radius * Math.sin(radian);
    const zIndex = Math.round(100 + 40 * Math.cos(radian));
    const opacity = Math.max(
      0.55,
      Math.min(1, 0.55 + 0.45 * ((1 + Math.sin(radian)) / 2))
    );

    return { x, y, zIndex, opacity };
  };

  const getStatusStyles = (status: TimelineItem["status"]): string => {
    switch (status) {
      case "completed":
        return "text-white bg-[#004737] border-transparent";
      case "in-progress":
        return "text-[#004737] bg-[#e8f5f1] border-[#004737]/30";
      case "pending":
      default:
        return "text-[#2d5f4f]/75 bg-white border-[#2d5f4f]/30";
    }
  };

  const orbitSize = Math.max(radius * 2, 260);
  const nodeSize = radius < 150 ? 46 : 58;
  const iconSize = radius < 150 ? 18 : 22;

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden  px-4 py-10 sm:px-6 lg:px-10",
        className
      )}
      ref={containerRef}
      onClick={handleContainerClick}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-10 top-0 h-44 "
      />

      <div className="relative mx-auto flex min-h-[620px] w-full max-w-5xl items-center justify-center">
        <div
          ref={orbitRef}
          className="absolute inset-0 flex items-center justify-center"
          style={{ perspective: "1000px" }}
        >
          <div
            className="absolute rounded-full border border-[#004737]/15"
            style={{ width: orbitSize, height: orbitSize }}
          />

          <div className="absolute z-10 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#22c55e] via-[#10b981] to-[#004737] shadow-[0_0_45px_rgba(16,185,129,0.35)]">
            <div className="absolute h-20 w-20 rounded-full border border-[#004737]/20 animate-orbital-ping" />
            <div className="absolute h-24 w-24 rounded-full border border-[#004737]/15 animate-orbital-ping [animation-delay:400ms]" />
            <div className="h-8 w-8 rounded-full bg-white/85 backdrop-blur-sm" />
          </div>

          {timelineData.map((item, index) => {
            const position = calculateNodePosition(index, timelineData.length);
            const isExpanded = !!expandedItems[item.id];
            const isRelated = isRelatedToActive(item.id);
            const isPulsing = !!pulseEffect[item.id];
            const Icon = item.icon;

            const auraSize = item.energy * 0.32 + nodeSize + 30;
            const auraOffset = (auraSize - nodeSize) / 2;

            const nodeStyle: CSSProperties = {
              left: "50%",
              top: "50%",
              transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
              zIndex: isExpanded ? 220 : position.zIndex,
              opacity: isExpanded ? 1 : position.opacity,
            };

            return (
              <div
                key={item.id}
                ref={(el) => {
                  nodeRefs.current[item.id] = el;
                }}
                className="absolute cursor-pointer transition-all duration-700"
                style={nodeStyle}
                onMouseEnter={() => toggleItem(item.id)}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleItem(item.id);
                }}
              >
                <div
                  className={cn(
                    "absolute -inset-1 rounded-full",
                    isPulsing && "animate-orbital-pulse"
                  )}
                  style={{
                    background:
                      "radial-gradient(circle, rgba(16,185,129,0.22) 0%, rgba(16,185,129,0) 72%)",
                    width: `${auraSize}px`,
                    height: `${auraSize}px`,
                    left: `-${auraOffset}px`,
                    top: `-${auraOffset}px`,
                  }}
                />

                <div
                  className={cn(
                    "flex items-center justify-center rounded-full border-2 transition-all duration-300",
                    isExpanded
                      ? "border-[#004737] bg-[#004737] text-white shadow-[0_0_18px_rgba(0,71,55,0.35)]"
                      : isRelated
                      ? "border-[#004737]/40 bg-[#dbefe8] text-[#004737]"
                      : "border-[#2d5f4f]/35 bg-white text-[#004737]"
                  )}
                  style={{
                    width: `${nodeSize}px`,
                    height: `${nodeSize}px`,
                    transform: isExpanded ? "scale(1.28)" : "scale(1)",
                  }}
                >
                  <Icon size={iconSize} />
                </div>

                <div
                  className={cn(
                    "absolute whitespace-nowrap text-xs font-semibold tracking-wide transition-all duration-300",
                    isExpanded ? "scale-110 text-[#004737]" : "text-[#2d5f4f]/75"
                  )}
                  style={{ top: `${nodeSize + 10}px` }}
                >
                  {item.title}
                </div>

                {isExpanded && (
                  <Card
                    className="absolute left-1/2 w-80 -translate-x-1/2 overflow-visible border-[#004737]/25 bg-white/95 shadow-[0_25px_55px_-35px_rgba(0,71,55,0.6)] backdrop-blur-lg"
                    style={{ top: `${nodeSize + 24}px` }}
                  >
                    <div className="absolute -top-3 left-1/2 h-3 w-px -translate-x-1/2 bg-[#004737]/40" />

                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between gap-2">
                        <Badge className={cn("px-2 text-[11px]", getStatusStyles(item.status))}>
                          {item.status === "completed"
                            ? "COMPLETE"
                            : item.status === "in-progress"
                            ? "IN PROGRESS"
                            : "PENDING"}
                        </Badge>
                        <span className="text-xs font-mono text-[#2d5f4f]/60">{item.date}</span>
                      </div>
                      <CardTitle className="mt-2 text-base text-[#004737]">{item.title}</CardTitle>
                      <p className="text-xs uppercase tracking-wide text-[#2d5f4f]/65">{item.category}</p>
                    </CardHeader>

                    <CardContent className="text-sm text-[#2d5f4f]/85">
                      <p>{item.content}</p>

                      <div className="mt-4 border-t border-[#004737]/10 pt-3">
                        <div className="mb-1 flex items-center justify-between text-xs">
                          <span className="flex items-center">
                            <Zap size={10} className="mr-1" />
                            Process Confidence
                          </span>
                          <span className="font-mono">{item.energy}%</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#004737]/10">
                          <div
                            className="h-full bg-gradient-to-r from-[#22c55e] to-[#004737]"
                            style={{ width: `${item.energy}%` }}
                          />
                        </div>
                      </div>

                      {item.relatedIds.length > 0 && (
                        <div className="mt-4 border-t border-[#004737]/10 pt-3">
                          <div className="mb-2 flex items-center">
                            <LinkIcon size={10} className="mr-1 text-[#2d5f4f]/70" />
                            <h4 className="text-xs font-medium uppercase tracking-wider text-[#2d5f4f]/70">
                              Connected Steps
                            </h4>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {item.relatedIds.map((relatedId) => {
                              const relatedItem = timelineData.find((i) => i.id === relatedId);
                              return (
                                <Button
                                  key={relatedId}
                                  variant="outline"
                                  size="sm"
                                  className="h-8 rounded-md border-[#004737]/20 px-3 text-xs text-[#004737] hover:bg-[#004737]/5"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleItem(relatedId);
                                  }}
                                >
                                  {relatedItem?.title ?? `Step ${relatedId}`}
                                  <ArrowRight size={8} className="ml-1 text-[#2d5f4f]/70" />
                                </Button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
