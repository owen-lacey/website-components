export function drawBipartiteGraph(
  svgElement: SVGElement,
  leftNodes: NodeListOf<Element>,
  rightNodes: NodeListOf<Element>,
  numbers: number[],
  correctColor: string,
  incorrectColor: string
) {
  const svgRect = svgElement.getBoundingClientRect();
  const existingPaths = Array.from(svgElement.querySelectorAll("path"));

  // Update existing paths or create new ones
  for (let i = 0; i < leftNodes.length; i++) {
    const leftNode = leftNodes[i] as HTMLElement;
    const rightNode = rightNodes[numbers[i] - 1] as HTMLElement;
    const color = numbers[i] === i + 1 ? correctColor : incorrectColor;

    const rect1 = leftNode.getBoundingClientRect();
    const rect2 = rightNode.getBoundingClientRect();

    // Start line from right edge of left node
    const x1 = rect1.left + rect1.width - svgRect.left;
    const y1 = rect1.top + rect1.height / 2 - svgRect.top;
    // End line at left edge of right node
    const x2 = rect2.left - svgRect.left;
    const y2 = rect2.top + rect2.height / 2 - svgRect.top;

    const newPathData = `M ${x1} ${y1} L ${x2} ${y2}`;

    if (existingPaths[i]) {
      // Update existing path with manual animation
      const path = existingPaths[i];
      const currentD = path.getAttribute("d");
      
      // Parse current coordinates
      if (currentD && currentD !== newPathData) {
        const currentMatch = currentD.match(/M ([\d.]+) ([\d.]+) L ([\d.]+) ([\d.]+)/);
        if (currentMatch) {
          const [, cx1, cy1, cx2, cy2] = currentMatch.map(Number);
          
          // Animate path with requestAnimationFrame
          const duration = 200;
          const startTime = performance.now();
          
          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Ease function
            const easeProgress = progress < 0.5
              ? 2 * progress * progress
              : 1 - Math.pow(-2 * progress + 2, 2) / 2;
            
            // Interpolate coordinates
            const ix1 = cx1 + (x1 - cx1) * easeProgress;
            const iy1 = cy1 + (y1 - cy1) * easeProgress;
            const ix2 = cx2 + (x2 - cx2) * easeProgress;
            const iy2 = cy2 + (y2 - cy2) * easeProgress;
            
            path.setAttribute("d", `M ${ix1} ${iy1} L ${ix2} ${iy2}`);
            
            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };
          
          requestAnimationFrame(animate);
        } else {
          path.setAttribute("d", newPathData);
        }
      } else {
        path.setAttribute("d", newPathData);
      }
      
      // Animate stroke color using Web Animations API (this works!)
      const currentStroke = path.getAttribute("stroke");
      if (currentStroke !== color) {
        path.animate(
          [{ stroke: currentStroke }, { stroke: color }],
          { duration: 100, easing: "ease", fill: "forwards" }
        );
      }
      path.setAttribute("stroke", color);
    } else {
      // Create new path if needed
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", newPathData);
      path.setAttribute("stroke", color);
      path.setAttribute("stroke-width", "2");
      path.setAttribute("fill", "none");
      path.classList.add("bipartite-line");
      svgElement.appendChild(path);
    }
  }

  // Remove extra paths if we have fewer connections now
  for (let i = leftNodes.length; i < existingPaths.length; i++) {
    existingPaths[i].remove();
  }
}