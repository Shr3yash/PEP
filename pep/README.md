# pep

[![PyPI - Version](https://img.shields.io/pypi/v/pep.svg)](https://pypi.org/project/pep)
[![PyPI - Python Version](https://img.shields.io/pypi/pyversions/pep.svg)](https://pypi.org/project/pep)

-----

## Table of Contents

- [Installation](#installation)
- [License](#license)

## Installation

  1. Install Python version 
  2. Create virtual environment 
```
python -m venv pep_env
```
  3. Activate virtual environment 
```
pep_env\Scripts\activate (windows)
```
  4. Install dependencies 
```
pip install -r requirements.txt
```
  5. Run app.py to start flask application
```
python app.py
```

## DB Tables

```
CREATE TABLE PEP_PARSED_LOGS (
    P_ID VARCHAR2(255) PRIMARY KEY,
    FILE_PATH VARCHAR2(255) NOT NULL,
    LOAD NUMBER  NOT NULL,
    START_INDICATOR VARCHAR2(255) NOT NULL,
    END_INDICATOR VARCHAR2(255) NOT NULL,
    PEAK VARCHAR2(255) NOT NULL,
    MEASRUE_UNITS VARCHAR2(255) NOT NULL
);


CREATE TABLE PEP_PARSED_METRICS (
    ID VARCHAR2(255) NOT NULL,
    TIME_STAMP VARCHAR2(255) NOT NULL,
    DURATION NUMBER NOT NULL,
    P_ID VARCHAR2(255) constraint PEP_FK REFERENCES PEP_PARSED_LOGS(P_ID),
    CONSTRAINT "PM_PK" PRIMARY KEY ("P_ID", "ID")
);
```

## Oracle
   The database using oracle than instantclient  required.

if your using 64 bit python than download client from below link
https://www.oracle.com/in/database/technologies/instant-client/winx64-64-downloads.html

if your using 32 bit python then download client from below link
https://www.oracle.com/in/database/technologies/instant-client/microsoft-windows-32-downloads.html

Extract into some location and set the path to System PATH in windows. 

## License

`pep` is distributed under the terms of the [MIT](https://spdx.org/licenses/MIT.html) license.
