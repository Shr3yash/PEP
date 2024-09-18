# save this as app.py
import logging

from flask import Flask, render_template, request, jsonify

from service import parse_logs,train_model_info,predict_all

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
    # file_paths = file_paths.split(';')
    file_paths = ['E:\\TLC\\pep\\file1.log',
                  'E:\\TLC\\pep\\file2.log',
                  'E:\\TLC\\pep\\file3.log',
                  'E:\\TLC\\pep\\file4.log']

    return parse_logs(file_paths, start_indicator, end_indicator, int(load), app.logger)


@app.route("/train", method=["POST"])
def train_model_based_on_job():
    app.logger.debug(request)
    try:
        # Extract job_id from POST request
        data = request.get_json()
        job_id = data.get('job_id')

        if not job_id:
            return jsonify({"error": "job_id not provided"}), 400
        app.logger.debug(f"Received job_id: {job_id}")
        result = train_model_info(job_id, app.logger)
        if result == 1:
            return jsonify({"message": "Model trained successfully", "result": result}), 200
        if result == -1:
            return jsonify({"message": "Not able to read db data", "result": result}), 400
    except Exception as e:
        app.logger.error(f"Error during model training: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/predict", method=["POST"])
def train_model_based_on_job():
    app.logger.debug(request)
    try:
        # Extract job_id from POST request
        data = request.get_json()
        job_id = data.get('job_id')
        load = data.get('load')
        if not job_id:
            return jsonify({"error": "job_id not provided"}), 400
        app.logger.debug(f"Received job_id: {job_id}")
        y_pre, lb, ub = predict_all(load, job_id)
        if len(y_pre) != 0:
            # to do- need to store data to DB incase required
            return jsonify({"message": "Model trained successfully", "result": y_pre}), 200
        if len(y_pre) == 0:
            return jsonify({"message": "Not able to predict from model", "result": y_pre}), 400
    except Exception as e:
        app.logger.error(f"Error during model training: {e}")
        return jsonify({"error": str(e)}), 500


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
