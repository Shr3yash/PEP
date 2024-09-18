from functools import wraps
import pandas as pd
import cx_Oracle

import constants
from utils import load_properties, get_option_value

__conn = None


def transaction(func):
    """
    Database transaction management.

    :param func: target function need database session and raw connection
    :return: wrapper
    """

    @wraps(func)
    def wrapper(*args):
        try:
            # creating engine
            create_db_connection()
            return func(*args)
        except Exception as e:
            raise e  # re-raise the exception, so the service method catch block can catch to log or update job
        finally:
            close_db_connection()

    return wrapper


def create_db_connection():
    # Connect to the Oracle database
    global __conn
    props = load_properties()
    if __conn is None:
        __conn = cx_Oracle.connect(get_option_value(props, constants.ERP_DATABASE_USERNAME),
                                   get_option_value(props, constants.ERP_DATABASE_PASSWORD),
                                   '{}:{}/{}'.format(get_option_value(props, constants.ERP_DATABASE_HOST),
                                                     get_option_value(props, constants.ERP_DATABASE_PORT),
                                                     get_option_value(props, constants.ERP_DATABASE_NAME)))


def close_db_connection():
    global __conn
    if __conn:
        __conn.close()
        __conn = None


def get_connection():
    global __conn
    if __conn:
        return __conn
    else:
        raise Exception('DB connection not open')


def insert_parsed_logs_data(parsed_log_file_data, logger):
    # Insert the employee into the database
    cursor = get_connection().cursor()
    cursor.execute(
        "Insert into PEP_PARSED_LOGS (P_ID,FILE_PATH,LOAD,START_INDICATOR,END_INDICATOR,PEAK,MEASRUE_UNITS) "
        "values (:P_ID,:FILE_PATHS,:LOAD,:START_INDICATOR,:END_INDICATOR,:PEAK,:MEASRUE_UNITS)",
        {'P_ID': parsed_log_file_data['p_id'], 'FILE_PATHS': parsed_log_file_data['file_paths'],
         'START_INDICATOR': parsed_log_file_data['start_indicator'],
         'END_INDICATOR': parsed_log_file_data['end_indicator'],
         'LOAD': parsed_log_file_data['load'], 'PEAK': parsed_log_file_data['max_peak'],
         'MEASRUE_UNITS': parsed_log_file_data['uom']})
    get_connection().commit()
    if cursor:
        cursor.close()


def insert_parsed_metrics(parsed_duration_data, p_id, logger):
    cursor = get_connection().cursor()
    for data in parsed_duration_data:
        logger.debug(data['id'])
        logger.debug(data['timestamp'])
        logger.debug(data['duration'])
        logger.debug(p_id)
        cursor.execute(
            "Insert into PEP_PARSED_METRICS (ID,TIME_STAMP,DURATION,P_ID) values (:ID,:TIME_STAMP,:DURATION,:P_ID)",
            {'ID': data['id'], 'TIME_STAMP': data['timestamp'], 'DURATION': data['duration'], 'P_ID': p_id})
    get_connection().commit()
    if cursor:
        cursor.close()


def get_job_based_data(jobid: str):
    # update the table name used to read load and duration based on job_id or other key
    query = f"SELECT load, duration FROM your_table_name WHERE job_id = :job_id"
    df = pd.read_sql(query, con=get_connection(), params={"job_id": jobid})
    return df
