def read_file(fname):
    f = open(fname)
    s = f.read()
    f.close()
    return s

def get_list(s):
    return s.split("\n")

def append_file(f,t):
    f = open(f,'a')
    f.write(t)
    f.close()

def write_file(f,t):
    f = open(f,'w')
    f.write(t)
    f.close
