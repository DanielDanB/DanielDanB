"""Scope the mockup's stylesheet under .arz-root for the Framer component.

Both products must render the same page, so the component does not get its own
hand-written CSS — it gets this one, mechanically rewritten:

  :root / html / body      -> .arz-root                  (variables on the root div)
  .js X                    -> .arz-root.arz-anim X       (animations, live site)
  html:not(.js) X          -> .arz-root.arz-static X     (resting state, canvas)
  anything else            -> .arz-root <selector>
"""
import re, sys

src = open(sys.argv[1]).read()
css = re.search(r"<style>(.*?)</style>", src, re.S).group(1)
css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)          # comments carry no rules

ROOT = ".arz-root"

def scope_one(sel: str) -> str:
    s = " ".join(sel.split())
    if not s:
        return s
    if s in ("html", "body", ":root"):
        return ROOT
    if s.startswith("html:not(.js)"):
        return (ROOT + ".arz-static" + s[len("html:not(.js)"):]).strip()
    if s.startswith(".js "):
        return ROOT + ".arz-anim " + s[4:]
    if s.startswith("html ") or s.startswith("body "):
        return ROOT + " " + s.split(" ", 1)[1]
    return ROOT + " " + s

def scope_sel_list(head: str) -> str:
    return ", ".join(scope_one(p) for p in head.split(","))

out, buf, stack = [], "", []
for ch in css:
    if ch == "{":
        head = " ".join(buf.split())
        buf = ""
        if head.startswith("@"):
            out.append(("  " * len(stack)) + head + " {")
            stack.append("at-keyframes" if head.startswith("@keyframes") else "at")
        else:
            inside_keyframes = stack and stack[-1] == "at-keyframes"
            sel = head if inside_keyframes else scope_sel_list(head)
            out.append(("  " * len(stack)) + sel + " {")
            stack.append("rule")
    elif ch == "}":
        body = " ".join(buf.split())
        buf = ""
        if body:
            out.append(("  " * len(stack)) + body)
        stack.pop()
        out.append(("  " * len(stack)) + "}")
    else:
        buf += ch

print("\n".join(l for l in out if l.strip()))
