import configparser

import constants


def load_properties():
    """
    Read local properties from application.properties file.

    :return: properties as dictionary
    """
    properties = configparser.ConfigParser(allow_no_value=True)
    with open(constants.PROPERTIES_FILE_PATH, 'r') as file:
        # application.properties from java and doesn't have section
        # we add bogus section to make configparser happy
        file_content = file.read()
        try:
            if '[' + constants.DEFAULT_PROPERTY_SECTION + ']' in file_content:
                properties.read_string(file_content)
            else:
                config_string = '[' + constants.DEFAULT_PROPERTY_SECTION + ']\n' + file_content
                properties.read_string(config_string)
        except FileNotFoundError as flie_error:
            raise Exception("Fail to find application.properties file, error message : {}".format(str(flie_error)))
        except Exception as e:
            raise Exception("Fail to read the properties from application.properties file: {}".format(str(e)))
    return properties


def get_option_value(props, option_key):
    """
    Get the option value from configparser object.If option not present than returns the None.

    :return: return option value if option key present. Otherwise returns None.
    """
    try:
        if isinstance(props, configparser.ConfigParser):
            return props.get(constants.DEFAULT_PROPERTY_SECTION, option_key)
    except configparser.NoOptionError:
        return None


def get_or_default(props, option_key, default_value):
    """
    Get the property value from configparser object if present otherwise return default value.

    :param props: config properties from application.properties
    :param option_key: key for search in properties
    :param default_value: default value
    :return: return option value if option key present. Otherwise returns default_value.
    """
    try:
        if isinstance(props, configparser.ConfigParser):
            return props.get(constants.DEFAULT_PROPERTY_SECTION, option_key)
    except configparser.NoOptionError:
        return default_value
