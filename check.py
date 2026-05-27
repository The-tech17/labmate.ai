import sys
def check():
    text = open('static/js/main.js', 'r', encoding='utf-8').read()
    o = { '{': 0, '(': 0, '[': 0 }
    c = { '}': 0, ')': 0, ']': 0 }
    for x in text:
        if x in o: o[x] += 1
        if x in c: c[x] += 1
    print('Brace:', o['{'], c['}'])
    print('Paren:', o['('], c[')'])
    print('Brack:', o['['], c[']'])
check()
