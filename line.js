function init() {
   
    d3.csv("./data/emigration.csv", function(data) {
        const parsedData = data.map(function(d) {
            return {
              Code: d.Code,
              Total: parseInt(d.Total)
            };
          });
        
          // Access the Total value for each entry in the parsedData array
          parsedData.forEach(function(d) {
            console.log(d.Total);
          });
        });
}

window.onload = init; 