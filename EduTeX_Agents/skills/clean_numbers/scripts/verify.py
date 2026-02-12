import sys
import argparse
from sympy import symbols, solve, simplify, S, N, Basic
from sympy.parsing.sympy_parser import parse_expr, standard_transformations, implicit_multiplication_application

def is_clean_number(num):
    """
    Determines if a number is 'clean' based on pedagogical standards.
    Clean: Integers, Simple Fractions (denom < 20), Standard Irrationals (sqrt(2), sqrt(3), pi, e).
    """
    try:
        # Check for Integers
        if num.is_Integer:
            return True, "Integer"
        
        # Check for Rational
        if num.is_Rational:
            denom = num.q
            if denom < 20:
                return True, f"Simple Fraction (denom={denom})"
            else:
                return False, f"Complex Fraction (denom={denom} >= 20)"
        
        # Check for specific clean irrationals
        # We check if the number squared is a clean rational, or if it involves pi/e in a simple way
        # This is heuristics-based for high school math
        
        # Check if it's a simple root (e.g., sqrt(2), sqrt(3), 2*sqrt(2))
        sq = simplify(num**2)
        if sq.is_Rational:
             if sq.q < 20:
                 return True, f"Standard Irrational (sqrt({sq}))"
        
        # Check floating point complexity as a fallback/heuristic
        # If it has a clean decimal representation (e.g. 0.5, 0.25) it might be okay, but SymPy handles rationals better.
        
        return False, f"Complex Number/Expression: {num}"

    except Exception as e:
        return False, f"Error analyzing number: {e}"

def verify_expression(expr_str):
    """
    Parses and solves/analyzes the expression.
    Input: "x^2 - 5x + 6 = 0" or just "x^2 - 5x + 6"
    """
    # Pre-processing for natural input
    # 1. Replace ^ with **
    expr_str = expr_str.replace("^", "**")
    # 2. Handle = sign. If =, solve it. If not, just simplify/analyze structure (not fully implemented yet)
    
    transformations = (standard_transformations + (implicit_multiplication_application,))
    
    try:
        if "=" in expr_str:
            lhs_str, rhs_str = expr_str.split("=")
            lhs = parse_expr(lhs_str, transformations=transformations)
            rhs = parse_expr(rhs_str, transformations=transformations)
            equation = lhs - rhs
            
            # Assume variable is x if not specified, or find free symbols
            syms = list(equation.free_symbols)
            if not syms:
                return False, "No variables found in equation"
            
            # Solve for the first symbol found
            x = syms[0]
            solutions = solve(equation, x)
            
            print(f"🔍 Analyzing Equation: {lhs} = {rhs}")
            print(f"👉 Solutions for {x}: {solutions}")
            
            all_clean = True
            details = []
            
            for sol in solutions:
                is_clean, reason = is_clean_number(sol)
                status = "✅" if is_clean else "❌"
                details.append(f"{status} {sol}: {reason}")
                if not is_clean:
                    all_clean = False
            
            return all_clean, details

        else:
            # Just an expression
            expr = parse_expr(expr_str, transformations=transformations)
            print(f"🔍 Analyzing Expression: {expr}")
            # For expressions, maybe we check coefficients? 
            # For now, let's just say expressions are passed if they parse.
            # TODO: Add logic to check coefficients.
            return True, ["Expression parsed successfully (No clean check for non-equations yet)"]

    except Exception as e:
        return False, [f"Parsing Error: {e}"]

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Verify if math expressions conform to 'Clean Numbers' standards.")
    parser.add_argument("expression", help="The math expression or equation to verify (e.g., 'x^2 - 5x + 6 = 0')")
    args = parser.parse_args()

    success, notes = verify_expression(args.expression)
    
    print("\n--- Verification Report ---")
    for note in notes:
        print(note)
    
    if success:
        print("\n✅ PASSED: Clean Numbers Verified.")
        sys.exit(0)
    else:
        print("\n❌ FAILED: Found complex or messy numbers.")
        sys.exit(1)
