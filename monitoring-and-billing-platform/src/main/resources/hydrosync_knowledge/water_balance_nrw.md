# Water Balance, Non-Revenue Water (NRW) & Outlier Detection
- Non-Revenue Water (NRW): Water supplied into the distribution network that is lost before reaching end-consumers due to piping leaks, bypasses, or metering errors.
- Water Balance: The mathematical comparison between total bulk water supplied/purchased at the community inlet versus the aggregate sum of individual household water meters.
- Distribution Loss: Calculated as `Total Bulk Water Supplied - Total Household Consumption`. High distribution loss signals main pipeline leaks or master meter inaccuracies.
- Outlier Detection: Algorithmic identification of households consuming significantly more water than their historical baseline or occupancy peers, indicating internal leaks (running toilets, faulty float valves).
- Efficiency Score: A 0-100 score rating household conservation performance based on normalized consumption per resident.
