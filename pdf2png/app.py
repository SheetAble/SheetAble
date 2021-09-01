'''
    This server is created because transforming a pdf to an image doesn't work properly in Go (currently),
    so I had to create a small flask server for that.
'''

from flask import Flask
from flask import request
from flask import send_file
from flask import after_this_request

import os
from pdf2image import convert_from_path


app = Flask(__name__)

'''
    POST request onto /createthumbnail with form data
    Form Data:
    file: ("your pdf file")
    name: "your sheet name"
'''

@app.route("/createthumbnail", methods=['POST'])
def index():
    print("in request")
    f = request.files['file']
    name = request.form['name']
    f.save(name + '.pdf')    

    createThumbnail(name)

    @after_this_request
    def cleanup(response):
        os.remove(f"./{name}.pdf")
        os.remove(f"./{name}.png") 
        return response

    return send_file(f'./{name}.png', attachment_filename='python.jpg')

  

def createThumbnail(name):
    createImg(f"./{name}.pdf", name)
    return 

def createImg(path, name):
    scale_factor = 2.5 # To scale up the size of the PNG
    pages = convert_from_path(path, single_file=True, size=(152 * scale_factor, 214 * scale_factor))

    pages[0].save(f'./{name}.png', 'PNG')
