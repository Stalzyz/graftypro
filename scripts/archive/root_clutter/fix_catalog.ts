import { readFileSync, writeFileSync } from 'fs';

const path = 'components/flow-builder/nodes/CatalogNode.tsx';
let code = readFileSync(path, 'utf8');
code = code.replace(/const prods = data\?\.carouselProducts || \(data\?\.productName .*/, 'const prods = data?.carouselProducts && data.carouselProducts.length > 0 ? data.carouselProducts : (data?.productName ? [{ name: data.productName, price: data.productPrice, image: data.productImage }] : []);');
writeFileSync(path, code);

const pPath = 'components/flow-builder/FlowPropertiesPanel.tsx';
let pCode = readFileSync(pPath, 'utf8');

pCode = pCode.replace(/const currentList = selectedNode\.data\?\.carouselProducts \|\| \(selectedNode\.data\?\.productName \? /g, 'const currentList = (selectedNode.data?.carouselProducts && selectedNode.data.carouselProducts.length > 0) ? selectedNode.data.carouselProducts : (selectedNode.data?.productName ? ');

pCode = pCode.replace(/\{\(selectedNode\.data\?\.carouselProducts \|\| \(selectedNode\.data\?\.productName \? /g, '{((selectedNode.data?.carouselProducts && selectedNode.data.carouselProducts.length > 0) ? selectedNode.data.carouselProducts : (selectedNode.data?.productName ? ');

writeFileSync(pPath, pCode);
console.log('Fixed typings locally!');
