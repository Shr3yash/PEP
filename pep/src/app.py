# save this as app.py
import logging

from flask import Flask, render_template, request

from service import parse_logs

app = Flask(__name__,
            static_url_path='',
            static_folder='static',
            template_folder='templates')
UPLOAD_FOLDER = 'static/upload'


@app.route("/parse-logs", methods=["POST"])
def measure_app_performance_from_logs():
    app.logger.debug(request)
    app.logger.debug(request.form['filePath'])
    app.logger.debug(request.form['processStart'])
    app.logger.debug(request.form['processEnd'])
    app.logger.debug(request.form['load'])
    file_paths = request.form['filePath']
    start_indicator = request.form['processStart']
    end_indicator = request.form['processEnd']
    load = request.form['load']
    #file_paths = file_paths.split(';')
    file_paths = ['E:\\TLC\\pep\\file1.log',
                  'E:\\TLC\\pep\\file2.log',
                  'E:\\TLC\\pep\\file3.log',
                  'E:\\TLC\\pep\\file4.log']

    return parse_logs(file_paths, start_indicator, end_indicator, int(load), app.logger)


@app.route("/get-parsed-logs", methods=["GET"])
def fetch_parsed_logs():
    pass


@app.route("/")
def index():
   return render_template("home.html")


if __name__ == '__main__':
    # instantiate logger
    logging.basicConfig(filename='pep.log',
                        level=logging.DEBUG,
                        format='%(asctime)s %(levelname)s %(name)s %(threadName)s : %(message)s')
    app.jinja_env.auto_reload = True
    app.config['TEMPLATES_AUTO_RELOAD'] = True
    app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
    app.run(debug=True, port=5000)
