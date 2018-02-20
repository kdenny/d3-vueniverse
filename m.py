import requests
import json

g = requests.get("http://127.0.0.1:8000/content_api/")
data = json.loads(g.text)
print(data)

with open("out.js", 'wb') as ofile:
  gt = 'export const contentData = ' + json.dumps(data)
  ofile.write(gt)
