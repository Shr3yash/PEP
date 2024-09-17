"""Setup Project."""
from setuptools import setup

install_requires = [
    'SQLAlchemy==1.3.17',
    'pyodbc==4.0.30', # for MSSQL DB
    'cx-Oracle==8.3.0', # for oracle DB
    'Flask'
]

install_prod_requires = [
    ## Add if any additional ones required
]

install_test_requires = [
    ## Add if any additional ones required
]

install_dev_requires = [
    ## Add if any additional ones required
]


setup(
    name='pep',
    install_requires=install_requires,
    extras_require={
        'prod': install_prod_requires,
        'dev': install_test_requires,
        'test': install_test_requires
    },
    include_package_data=True,
    license='TODO proper license info',
    author='dummy',
    author_email='dummy',
)