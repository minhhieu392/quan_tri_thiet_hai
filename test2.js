const mang = [
  { id: 1, name: 'a' },
  { id: 3, name: 'd', parentId: 1 },
  { id: 2, name: 'b' }
];
const object = {};

mang.forEach(e => {
  object[e.id] = e;
});
// const object = {
//   1: { id: 1, name: 'a' },
//   3: { id: 3, name: 'b' },
//   2: { id: 2, name: 'b' }
// };
object[3].parent = object[object[3].parentId];
console.log('mang', mang);
