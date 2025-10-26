# Yellow Line Rendering Analysis

## Issue: Seeing n-1 lines instead of n lines

### 1. How intersection points are ordered in the intersectionPoints array

The code loops through each edge (i = 0 to n-1) and for each edge:
- Creates 2 intersection points (p1 and p2)
- p1 is at position t1 = cEdge/s along the edge
- p2 is at position t2 = 1 - cEdge/s along the edge
- Points are pushed in order: p1, p2 for edge 0, then p1, p2 for edge 1, etc.

So for a hexagon (n=6), the array order is:
```
[edge0_p1, edge0_p2, edge1_p1, edge1_p2, edge2_p1, edge2_p2, edge3_p1, edge3_p2, edge4_p1, edge4_p2, edge5_p1, edge5_p2]
```

### 2. Visual pattern the yellow lines should create

The yellow polyline connects all points in the order they appear in the array, with `closed=true` meaning it connects the last point back to the first.

Expected pattern:
- The lines should form a star-like or zigzag pattern
- Starting from edge0_p1, it draws to edge0_p2 (along edge 0)
- Then jumps to edge1_p1 (crossing the polygon)
- Then to edge1_p2 (along edge 1)
- And so on...

### 3. Why you see n-1 lines instead of n

The issue is that when `closed=true`, the Line component automatically connects the last point back to the first point. This creates one additional line segment.

For n edges with 2n points:
- Sequential connections: 2n-1 line segments (connecting adjacent points in array)
- Plus closing line: 1 line segment (last point to first point)
- Total: 2n line segments

But visually, some of these lines overlap or appear as single lines because:
- Lines along edges (p1 to p2 on same edge) are visible as edge segments
- Lines crossing the polygon create the star pattern
- The closing line from the last point (edge[n-1]_p2) back to the first point (edge0_p1) creates an asymmetry

### Solution

The current ordering creates an unintended pattern. To get exactly n visible lines forming a proper inner polygon, the points need to be reordered. Instead of:
```
[edge0_p1, edge0_p2, edge1_p1, edge1_p2, ...]
```

You likely want either:
1. Just the first points: `[edge0_p1, edge1_p1, edge2_p1, ...]` (n points, n lines)
2. Just the second points: `[edge0_p2, edge1_p2, edge2_p2, ...]` (n points, n lines)
3. Or a specific traversal order that creates the intended pattern

The current implementation mixes both intersection points, creating a complex zigzag pattern rather than a simple inner polygon.