export default function AddTree(obj, tree = []) {
  const updatedObj = { ...obj, tree: [...tree] };
  if (updatedObj.child && updatedObj.child.length > 0) {
    updatedObj.child = updatedObj.child.map(
      (childObj, index) => AddTree(childObj, [...tree, index]),
    );
  }
  return updatedObj;
}
