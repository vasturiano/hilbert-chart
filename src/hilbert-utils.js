import accessorFn from 'accessor-fn';

export function minNumber(...nums) {
  return nums.reduce((min, current) => current < min ? current : min);
}

export function maxNumber(...nums) {
  return nums.reduce((max, current) => current > max ? current : max);
}

export function numberComparator(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}

export function updateRangeTooltip(state, d) {
  let content = false;
  if (state.showRangeTooltip && d) {
    if (state.rangeTooltipContent) {
      content = accessorFn(state.rangeTooltipContent)(d);
    } else {
      // default content
      const label = accessorFn(state.rangeLabel)(d);
      content = `${label ? `<b>${label}</b>: ` : ''}${state.valFormatter(d.start) + (d.length > 1 ? ' - ' + state.valFormatter(d.start + d.length - (typeof d.start === 'bigint' ? 1n : 1)) : '')}`;
    }
  }
  state.rangeTooltip.content(content);
}

export function getHilbertPath(vertices) {
  if (!vertices.every(v => v === 'L')) {
    let path = 'M0 0L0 0';
    vertices.forEach(vertex => {
      switch (vertex) {
        case 'U': path += 'v-1'; break;
        case 'D': path += 'v1'; break;
        case 'L': path += 'h-1'; break;
        case 'R': path += 'h1'; break;
      }
    });
    return path;
  }

  // reverse path (to prevent upside down text)
  let path = '';
  const lastPos = [0, 0];
  vertices.slice().reverse().forEach(vertex => {
    switch (vertex) {
      case 'U': path += 'v1'; lastPos[1] -= 1; break;
      case 'D': path += 'v-1'; lastPos[1] += 1; break;
      case 'L': path += 'h1'; lastPos[0] -= 1; break;
      case 'R': path += 'h-1'; lastPos[0] += 1; break;
    }
  });
  return `M${lastPos.join(' ')}L${lastPos.join(' ')}${path}`;
}
