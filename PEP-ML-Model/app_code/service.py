from datetime import datetime
from database import insert_parsed_logs_data, insert_parsed_metrics, transaction, get_job_based_data
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression, Ridge, Lasso
from sklearn.preprocessing import PolynomialFeatures
from sklearn.metrics import mean_squared_error, r2_score
import numpy as np
import matplotlib.pyplot as plt
from scipy import stats
import pickle


@transaction
def parse_logs(file_paths: str, start_indicator: str, end_indicator: str, load: int, logger):
    # Initialize lists to store start and end times for Process_Start1 and Process_End1
    max_peak_list = []
    parsed_logs_files_list = []
    average_sequence_peak = None
    uom = 'seconds'
    for file_path in file_paths:
        p_id = datetime.now().strftime('%Y-%m-%d-%H-%M%S')
        parsed_log_file_data = {}
        parsed_duration_data = []

        start_times = []
        end_times = []
        parsed_log_file_data.update({'file_paths': file_path})
        parsed_log_file_data.update({'start_indicator': start_indicator})
        parsed_log_file_data.update({'end_indicator': end_indicator})
        parsed_log_file_data.update({'load': load})
        parsed_log_file_data.update({'p_id': p_id})
        # Read the log data from the file
        with open(file_path, 'r') as file:
            for line in file:
                # Split the log entry to extract timestamp and JobId
                parts = line.split(' - ')
                timestamp_str = parts[0]
                message = parts[-1].strip()
                # Convert the timestamp to a datetime object
                timestamp = datetime.strptime(timestamp_str, "%Y-%m-%d %H:%M:%S,%f")
                # Store start and end times for Process_Start1 and Process_End1
                if message == start_indicator:
                    logger.debug(timestamp)
                    start_times.append(timestamp)
                elif message == end_indicator:
                    logger.debug(timestamp)
                    end_times.append(timestamp)
        logger.debug(start_times)
        logger.debug(end_times)
        # Calculate and print the time differences
        durations_list = []
        for i in range(min(len(start_times), len(end_times))):
            peak_dict = {}

            time_diff = end_times[i] - start_times[i]
            peak_dict.update({'timestamp': str(start_times[i])})
            logger.debug(f"Time difference for Process_Start1 and Process_End1 instance {i + 1}: {time_diff}")
            peak_dict.update({'duration': time_diff.seconds})
            durations_list.append(time_diff.seconds)
            peak_dict.update({'id': i + 1})
            parsed_duration_data.append(peak_dict)
            logger.debug(peak_dict.items())
        logger.debug(parsed_log_file_data)
        logger.debug(parsed_duration_data)
        max_peak_item = max(durations_list)
        parsed_log_file_data.update({'max_peak': max_peak_item})
        max_peak_list.append(max_peak_item)
        parsed_log_file_data.update({'uom': uom})
        insert_parsed_logs_data(parsed_log_file_data, logger)
        insert_parsed_metrics(parsed_duration_data, p_id, logger)
        parsed_log_file_data.update({"duration_data": parsed_duration_data})
        parsed_logs_files_list.append(parsed_log_file_data)
    if len(max_peak_list) > 0:
        average_sequence_peak = round(sum(max_peak_list) / len(max_peak_list), 2)
    logger.debug(average_sequence_peak)
    print(average_sequence_peak)
    print(parsed_logs_files_list)
    return generate_response(parsed_logs_files_list, average_sequence_peak, start_indicator, end_indicator, load,
                             uom, logger)


def generate_response(parsed_logs_files_list, average_sequence_peak, start_indicator: str, end_indicator: str,
                      load: int,
                      uom, logger):
    response_message = {}
    response_message.update({"start_indicator": start_indicator})
    response_message.update({"end_indicator": end_indicator})
    response_message.update({"load": load})
    response_message.update({"average_sequence_peak": average_sequence_peak})
    response_message.update({"time_metrics": uom})
    collection = []
    for each_file_data in parsed_logs_files_list:
        response_file_dict = {}
        response_file_dict.update({'file_location': each_file_data['file_paths']})
        response_file_dict.update({'sequence_peak': each_file_data['max_peak']})
        parsed_data = []
        for duration_data_item in each_file_data['duration_data']:
            response_data_item = {}
            response_data_item.update({'id': duration_data_item['id']})
            response_data_item.update({'time_stamp': duration_data_item['timestamp']})
            response_data_item.update({'duration': duration_data_item['duration']})
            parsed_data.append(response_data_item)
        response_file_dict.update({'parsed_data': parsed_data})
        collection.append(response_file_dict)
    response_message.update({'collection': collection})
    logger.debug('############# start Final Response ##########')
    logger.debug(response_message)
    logger.debug('############# end Final Response ##########')
    return response_message


def fetch_parsed_data_from_db():
    pass


def train_model_info(job_id: str, logger):
    # Query Oracle database to get load and duration using the job_id
    df = get_job_based_data(job_id)
    if df.empty:
        return -1
    logger.debug(f"Data loaded for job_id {job_id}: {df}")
    # Split data into features (X) and target (y)
    X = df[['load']]
    y = df['duration']
    # Split the data into training and testing sets
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Initialize models to test
    linear_model = LinearRegression()
    ridge_model = Ridge(alpha=1.0)
    lasso_model = Lasso(alpha=0.1)

    # Fit each model to the training data
    linear_model.fit(X_train, y_train)
    ridge_model.fit(X_train, y_train)
    lasso_model.fit(X_train, y_train)

    # Make predictions with each model on the test set
    y_pred_linear = linear_model.predict(X_test)
    y_pred_ridge = ridge_model.predict(X_test)
    y_pred_lasso = lasso_model.predict(X_test)

    # Evaluate each model's performance
    mse_linear = mean_squared_error(y_test, y_pred_linear)
    r2_linear = r2_score(y_test, y_pred_linear)

    mse_ridge = mean_squared_error(y_test, y_pred_ridge)
    r2_ridge = r2_score(y_test, y_pred_ridge)

    mse_lasso = mean_squared_error(y_test, y_pred_lasso)
    r2_lasso = r2_score(y_test, y_pred_lasso)

    # Display the performance of each model and look for the best one
    best_model_by_mse = select_best_model(mse_linear, r2_linear, mse_ridge, r2_ridge, mse_lasso, r2_lasso, metric='mse')
    best_model_by_r2 = select_best_model(mse_linear, r2_linear, mse_ridge, r2_ridge, mse_lasso, r2_lasso, metric='r2')
    print(f"Best model based on MSE: {best_model_by_mse}")
    print(f"Best model based on R-squared: {best_model_by_r2}")
    model_pkl_file = "linear" + job_id + ".pk"
    with open(model_pkl_file, 'wb') as file:
        pickle.dump(linear_model, file)
    return 1


def select_best_model(mse_linear, r2_linear, mse_ridge, r2_ridge, mse_lasso, r2_lasso, metric='mse'):
    """
    Select the best model based on the given metric ('mse' or 'r2').

    Parameters:
    mse_linear, r2_linear, mse_ridge, r2_ridge, mse_lasso, r2_lasso : float
        Performance metrics of the linear, ridge, and lasso regression models.

    metric : str, default='mse'
        The metric to use for model selection. Options are 'mse' (Mean Squared Error) or 'r2' (R-squared).

    Returns:
    str
        The name of the best model ('linear', 'ridge', or 'lasso').
    """
    if metric == 'mse':
        # Select the model with the lowest MSE
        mse_values = {'linear': mse_linear, 'ridge': mse_ridge, 'lasso': mse_lasso}
        best_model = min(mse_values, key=mse_values.get)
    elif metric == 'r2':
        # Select the model with the highest R-squared
        r2_values = {'linear': r2_linear, 'ridge': r2_ridge, 'lasso': r2_lasso}
        best_model = max(r2_values, key=r2_values.get)
    else:
        raise ValueError("Invalid metric specified. Choose either 'mse' or 'r2'.")

    return best_model


def predict_all(load: list, job_id: str):
    # load model from pickle file
    model_pkl_file = "linear" + job_id + ".pk"
    with open(model_pkl_file, 'rb') as file:
        model = pickle.load(file)
    # evaluate model
    y_predict = model.predict(load)
    # Calculate the confidence interval for predictions
    confidence_interval = 1.96 * np.std(y_predict) / np.sqrt(len(load))
    lower_bound = y_predict - confidence_interval
    upper_bound = y_predict + confidence_interval
    return y_predict, lower_bound, upper_bound

