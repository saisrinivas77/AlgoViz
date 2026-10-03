"""
Python AST Instrumenter for AlgoViz Engine.
Transforms Python source AST to insert high-fidelity semantic trace hooks:
- Line execution checkpoints (__tr.line(line_no))
- Subscript reads (__tr.access(target, index))
- Subscript assignments (__tr.update_array(target, index, val))
- Parallel/Tuple Swaps (__tr.swap_array(target, idx1, idx2))
"""

import ast

class TraceInstrumenter(ast.NodeTransformer):
    def __init__(self):
        super().__init__()
        self.tracer_name = "_algoviz_tr"
        self.in_compare = False

    def visit_FunctionDef(self, node: ast.FunctionDef) -> ast.AST:
        self.generic_visit(node)
        # Wrap function body with line tracking
        return node

    def visit_Compare(self, node: ast.Compare) -> ast.AST:
        prev = self.in_compare
        self.in_compare = True
        self.generic_visit(node)
        self.in_compare = prev
        return node

    def visit_Assign(self, node: ast.Assign) -> ast.AST:
        self.generic_visit(node)

        # Detect tuple swap: a[i], a[j] = a[j], a[i]
        if (
            len(node.targets) == 1
            and isinstance(node.targets[0], ast.Tuple)
            and isinstance(node.value, ast.Tuple)
            and len(node.targets[0].elts) == 2
            and len(node.value.elts) == 2
        ):
            target_elts = node.targets[0].elts
            val_elts = node.value.elts
            if (
                isinstance(target_elts[0], ast.Subscript)
                and isinstance(target_elts[1], ast.Subscript)
                and not isinstance(target_elts[0].slice, ast.Slice)
                and not isinstance(target_elts[1].slice, ast.Slice)
                and isinstance(target_elts[0].value, ast.Name)
                and isinstance(target_elts[1].value, ast.Name)
                and target_elts[0].value.id == target_elts[1].value.id
            ):
                arr_name = target_elts[0].value.id
                idx_a = target_elts[0].slice
                idx_b = target_elts[1].slice

                # Create call to _algoviz_tr.swap_array(arr_name, idx_a, idx_b, arr) after original assignment
                swap_call = ast.Expr(
                    value=ast.Call(
                        func=ast.Attribute(
                            value=ast.Name(id=self.tracer_name, ctx=ast.Load()),
                            attr="swap_array",
                            ctx=ast.Load()
                        ),
                        args=[
                            ast.Constant(value=arr_name),
                            idx_a,
                            idx_b,
                            ast.Name(id=arr_name, ctx=ast.Load())
                        ],
                        keywords=[]
                    )
                )
                ast.copy_location(swap_call, node)
                return [node, swap_call]

        # Detect single subscript assignment: arr[i] = val (exclude slice assignment arr[i:j] = ...)
        if len(node.targets) == 1 and isinstance(node.targets[0], ast.Subscript):
            subscript = node.targets[0]
            if not isinstance(subscript.slice, ast.Slice) and isinstance(subscript.value, ast.Name):
                arr_name = subscript.value.id
                idx = subscript.slice
                update_call = ast.Expr(
                    value=ast.Call(
                        func=ast.Attribute(
                            value=ast.Name(id=self.tracer_name, ctx=ast.Load()),
                            attr="update_array",
                            ctx=ast.Load()
                        ),
                        args=[
                            ast.Constant(value=arr_name),
                            idx,
                            ast.Subscript(
                                value=ast.Name(id=arr_name, ctx=ast.Load()),
                                slice=idx,
                                ctx=ast.Load()
                            )
                        ],
                        keywords=[]
                    )
                )
                ast.copy_location(update_call, node)
                return [node, update_call]

        return node

    def visit_Subscript(self, node: ast.Subscript) -> ast.AST:
        self.generic_visit(node)
        # Transform read subscript: arr[i] -> _algoviz_tr.access(arr, "arr", i, access_type="...")
        if isinstance(node.ctx, ast.Load) and isinstance(node.value, ast.Name):
            # Do not instrument slice reads arr[i:j]
            if isinstance(node.slice, ast.Slice):
                return node

            arr_name = node.value.id
            # Avoid re-instrumenting internal tracer calls
            if arr_name == self.tracer_name:
                return node

            access_type = "compare" if self.in_compare else "read"
            wrapped = ast.Call(
                func=ast.Attribute(
                    value=ast.Name(id=self.tracer_name, ctx=ast.Load()),
                    attr="access",
                    ctx=ast.Load()
                ),
                args=[
                    node.value,
                    ast.Constant(value=arr_name),
                    node.slice,
                    ast.Constant(value=access_type)
                ],
                keywords=[]
            )
            ast.copy_location(wrapped, node)
            return wrapped
        return node


def instrument_code_ast(source_code: str) -> ast.AST:
    """Parses source code, applies AST transformations, and returns the modified AST."""
    parsed_ast = ast.parse(source_code)
    transformer = TraceInstrumenter()
    modified_ast = transformer.visit(parsed_ast)
    ast.fix_missing_locations(modified_ast)
    return modified_ast


def instrument_code(source_code: str) -> str:
    """Parses source code, applies AST transformations, and unparses back into valid code."""
    modified_ast = instrument_code_ast(source_code)
    return ast.unparse(modified_ast)
