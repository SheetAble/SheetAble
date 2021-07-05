'''
    This server is created because transforming a pdf to an image doesn't work properly in Go (currently),
    so I had to create a small flask server for that.
'''

from flask import Flask
from flask import request
from pdf2image import convert_from_path

app = Flask(__name__)

'''
    POST request onto /createthumbnail with form data
    Form Data:
    path: "your path name"
    name: "your sheet name"
'''
@app.route("/createthumbnail", methods=['POST'])
def index():
    print(request.form['path'], request.form['name'])
    createImg(f"../{request.form['path']}", request.form['name'])
    return "created Image succesfully"

def createImg(path, name):
    pages = convert_from_path(path)

    pages[0].save(f'../thumbnails/{name}.png', 'PNG')


if __name__ == '__main__':
    app.run()
