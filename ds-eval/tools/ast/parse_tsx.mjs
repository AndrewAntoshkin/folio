import fs from "node:fs";
import parser from "@babel/parser";
import traverseMod from "@babel/traverse";

const traverse = traverseMod.default ?? traverseMod;

const file = process.argv[2];
const code = fs.readFileSync(file, "utf8");
const ast = parser.parse(code, {
  sourceType: "module",
  plugins: ["jsx", "typescript"],
  errorRecovery: true,
});

const HEX = /#(?:[0-9a-fA-F]{3,8})\b/;
const result = {
  imports: [],
  jsx_tags: [],
  native_elements: [],
  hex_literals: [],
  has_task_export: false,
};

const native = new Set(["button", "select", "input", "textarea"]);

traverse(ast, {
  ImportDeclaration(path) {
    const names = [];
    for (const spec of path.node.specifiers) {
      if (spec.local?.name) names.push(spec.local.name);
    }
    result.imports.push({ source: path.node.source.value, names });
  },
  JSXOpeningElement(path) {
    const nameNode = path.node.name;
    const name = nameNode.name || nameNode.object?.name;
    if (!name) return;
    result.jsx_tags.push(name);
    if (native.has(String(name))) result.native_elements.push(String(name));
  },
  StringLiteral(path) {
    const value = path.node.value || "";
    const hits = value.match(HEX);
    if (hits) result.hex_literals.push(...hits);
  },
  TemplateLiteral(path) {
    for (const part of path.node.quasis) {
      const hits = (part.value.cooked || "").match(HEX);
      if (hits) result.hex_literals.push(...hits);
    }
  },
  ExportNamedDeclaration(path) {
    const decl = path.node.declaration;
    if (decl?.id?.name === "Task") result.has_task_export = true;
    if (decl?.declarations) {
      for (const d of decl.declarations) {
        if (d.id?.name === "Task") result.has_task_export = true;
      }
    }
  },
  ExportDefaultDeclaration() {
    result.has_task_export = true;
  },
});

result.jsx_tags = [...new Set(result.jsx_tags)];
result.native_elements = [...new Set(result.native_elements)];
result.hex_literals = [...new Set(result.hex_literals)];
process.stdout.write(JSON.stringify(result));
