# import necessary libraries
import numpy as np

# import sqlalchemy
import sqlalchemy

# Imports the method used for connecting to DBs
from sqlalchemy import create_engine

# Imports the methods needed to abstract classes into tables
from sqlalchemy.ext.declarative import declarative_base

# Allow us to declare column types
from sqlalchemy import Column, Integer, String, Float, Date

from sqlalchemy.ext.automap import automap_base

from sqlalchemy.orm import Session

from sqlalchemy import create_engine, inspect

from sqlalchemy import func

# Sets an object to utilize the default declarative base in SQL Alchemy
Base = declarative_base()

from flask import (
    Flask,
    render_template,
    jsonify,
    request,
    redirect)

#################################################
# Flask Setup
#################################################
app = Flask(__name__)

#################################################
# Database Setup
#################################################
from flask_sqlalchemy import SQLAlchemy
# Create engine using the `hawaii.sqlite` database file
engine = create_engine("sqlite:///belly_button_biodiversity.sqlite")

# Declare a Base using `automap_base()`
Base = automap_base()

# Use the Base class to reflect the database tables
Base.prepare(engine, reflect=True)

# Assign the OTU class to a variable called `OTU`
Otu = Base.classes.otu

# Assign the Samples class to a variable called `Samples`
Samples = Base.classes.samples

# Assign the Samples metadata class to a variable called `Samples`
Samples_metadata = Base.classes.samples_metadata

# inspector to view table value
inspector = inspect(engine)

# Create a session
session = Session(engine)

# create route that renders index.html template
@app.route("/")
def home():
    return render_template("index.html")

@app.route("/names")
def sample_names():
    
    names=[]
    columns = inspector.get_columns('Samples')
    for column in columns:
        if (column['name'][0:3] == 'BB_'):
            names.append(column['name'])
    
    return jsonify(names)

@app.route("/otu")
def otu():
    otu_description = []
    otu_observation = session.query(Otu.lowest_taxonomic_unit_found).all()
    for row in otu_observation:
        otu_description.append(row[0])
    
    return jsonify(otu_description)

@app.route("/metadata/<sample>")
def metadata_sample(sample):
    
    sampleid = sample[3:]
    metadata_dict = {}

    sel = [
    Samples_metadata.AGE,
    Samples_metadata.BBTYPE,
    Samples_metadata.ETHNICITY,
    Samples_metadata.GENDER,
    Samples_metadata.LOCATION,
    Samples_metadata.SAMPLEID]

    meta_sample = session.query(*sel).filter(Samples_metadata.SAMPLEID == sampleid)
    
    for row in meta_sample:
        metadata_dict["AGE"] = row[0]
        metadata_dict["BBTYPE"] = row[1]
        metadata_dict["ETHNICITY"] = row[2]
        metadata_dict["GENDER"] = row[3]
        metadata_dict["LOCATION"] = row[4]
        metadata_dict["SAMPLEID"] = row[5]

    return jsonify(metadata_dict)

@app.route('/wfreq/<sample>')
def wfreq_sample(sample):
    
    sampleid = sample[3:]
    wfreq_dict = {}

    sel = [
    Samples_metadata.WFREQ]

    meta_sample = session.query(*sel).filter(Samples_metadata.SAMPLEID == sampleid)
    
    for row in meta_sample:
        if (row[0] == 0):
                wfreq_dict["WFREQ"] = 0
                wfreq_dict["SAMPLEID"] = sampleid
        else:
                wfreq_dict["WFREQ"] = row[0]
                wfreq_dict["SAMPLEID"] = sampleid

    return jsonify(wfreq_dict)


@app.route('/samples/<sample>')
def samples(sample):
    sample_dict = {}
    otu_ids = []
    sample_values = []

    results = session.query(Samples.otu_id,getattr(Samples, sample)).filter(getattr(Samples, sample) > (0)).order_by(getattr(Samples, sample).desc())

    for row in results:
        otu_ids.append(row[0])
        sample_values.append(row[1])

    sample_dict = {"otu_ids":otu_ids,"sample_values":sample_values}

    return jsonify(sample_dict)

if __name__ == "__main__":
    app.run()
