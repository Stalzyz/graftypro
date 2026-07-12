import { MetaFormCompiler } from './lib/whatsapp/meta-form-compiler.ts';
const fields = [
  { type: "TextInput", label: "Shopify Store Link", name: "shopify_store_link" },
  { type: "CheckboxGroup", label: "Why are you looking for an alternative to Shopify?", options: ["Monthly subscription costs", "Expensive a"], name: "why_are_you_looking" }
];
console.log(JSON.stringify(MetaFormCompiler.compileSingleScreen(fields as any), null, 2));
