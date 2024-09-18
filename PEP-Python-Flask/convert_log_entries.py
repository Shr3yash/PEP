def convert_log_entries(log_entries):
    converted_entries = []
    for entry in log_entries:
        converted_entry = {
            "id": entry["id"],
            "series": "Duration Series",
            "quarter": entry["time_stamp"],
            "value": entry["duration"]
        }
        converted_entries.append(converted_entry)
    
    return converted_entries

log_entries = [
    {
        "duration": 3720,
        "id": 1,
        "time_stamp": "2024-09-11 01:00:00"
    },
    {
        "duration": 6000,
        "id": 2,
        "time_stamp": "2024-09-11 07:10:00"
    },
    {
        "duration": 3600,
        "id": 3,
        "time_stamp": "2024-09-11 13:00:00"
    },
    {
        "duration": 10800,
        "id": 4,
        "time_stamp": "2024-09-11 13:00:00"
    },
    {
        "duration": 10800,
        "id": 5,
        "time_stamp": "2024-09-11 14:00:00"
    },
    {
        "duration": 10800,
        "id": 6,
        "time_stamp": "2024-09-11 15:00:00"
    }
]

converted_entries = convert_log_entries(log_entries)

for entry in converted_entries:
    print(entry)
