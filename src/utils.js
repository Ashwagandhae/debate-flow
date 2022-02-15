export function boxFromPath(path, scope) {
  if (!scope) {
    scope = 0;
  }
  let ret = flow;
  if (path.length > 1) {
    for (let i = 1; i < path.length - scope; i++) {
      ret = ret.children[path[i]];
    }
  }
  return ret;
}
