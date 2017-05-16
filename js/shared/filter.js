//Filter epochToDate :
//Use for convert epoch date format to default date format.
//Example :
//<p>{{item.createdAt |epochToDate | date:"short"}}</p>
appControllers.filter('epochToDate', function ($filter) {
    return function (input) {
        return new Date(Date(input));
    };
});// End Filter epochToDate.

//Filter numberSuffix :
//Use for convert number to have suffix 1,000 to 1K.
//Example :
//{{item.likes.summary.total_count | numberSuffix}}
//
appControllers.filter('numberSuffix', function () {
    return function (input) {
        var exp;
        var suffixes = ['k', 'M', 'G', 'T', 'P', 'E'];

        if (window.isNaN(input)) {
            return 0;
        }

        if (input < 1000) {
            return input;
        }

        exp = Math.floor(Math.log(input) / Math.log(1000));

        return (input / Math.pow(1000, exp)).toFixed(1) + suffixes[exp - 1];
    }
});// End Filter numberSuffix.

appControllers.filter('validMonths', function () {
    return function (months, year) {
        var filtered = [];
        var now = new Date();
        var over18Month = now.getUTCMonth() + 1;
        var over18Year = now.getUTCFullYear() - 18;
        if(year != ""){
            if(year == over18Year){
                angular.forEach(months, function (month) {
                    if (month.id <= over18Month) {
                        filtered.push(month);
                    }
                });
            }
            else{
                angular.forEach(months, function (month) {
                        filtered.push(month);
                });
            }
        }
        return filtered;
    };
});

appControllers.filter('daysInMonth', function () {
    return function (days, year, month) {
        var filtered = [];
                angular.forEach(days, function (day) {
                    // console.log(month);
                    if (month != "" && typeof(month) != 'undefined'){
                        if (month.id == 1 || month.id == 3 || month.id == 5 || month.id == 7 || month.id == 8 || month.id == 10 || month.id == 12) {
                            filtered.push(day);
                        }
                        else if ((month.id == 4 || month.id == 6 || month.id == 9 || month.id == 11) && day <= 30){
                            filtered.push(day);
                        }
                        else if (month.id == 2){
                            if (year % 4 == 0 && day <= 29){
                                filtered.push(day);
                            }
                            else if (day <= 28){
                                filtered.push(day);
                            }
                        }
                    }
                });
        return filtered;
    };
});

appControllers.filter('validDays', function () {
    return function (days, year, month) {
        var filtered = [];
        var now = new Date();
        var over18Day = now.getUTCDate();
        var over18Month = now.getUTCMonth() + 1;
        var over18Year = now.getUTCFullYear() - 18;
        if(year == over18Year && month.id == over18Month){
            angular.forEach(days, function (day) {
                if (day <= over18Day) {
                    filtered.push(day);
                }
            });
        }
        else{
            angular.forEach(days, function (day) {
                    filtered.push(day);
            });
        }
        return filtered;
    };
});