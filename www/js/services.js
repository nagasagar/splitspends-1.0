angular.module('starter.services', ['starter.config'])

// DB wrapper
.factory('DB', function($q, $cordovaSQLite, DB_CONFIG) {
    var self = this;
    self.db = null;

    self.init = function() {
        if (window.cordova) {
            self.db = $cordovaSQLite.openDB(DB_CONFIG.name);
        } else {
            self.db = window.openDatabase(DB_CONFIG.name, '1.0', 'database', -1);
        }
        // Build Query String 
        angular.forEach(DB_CONFIG.tables, function(table) {
            var columns = [];
            var foreignkeys = [];

            angular.forEach(table.columns, function(column) {
                columns.push(column.name + ' ' + column.type);
            });
            angular.forEach(table.foreignkeys, function(foreignkey) {
                foreignkeys.push('FOREIGN KEY ' + foreignkey.who + ' REFERENCES ' + foreignkey.whom);
            });

            if (table.foreignkeys) {
                var createtablequery = 'CREATE TABLE IF NOT EXISTS ' + table.name + ' (' + columns.join(',') + ',' + foreignkeys.join(',') + ')';
            } else {
                var createtablequery = 'CREATE TABLE IF NOT EXISTS ' + table.name + ' (' + columns.join(',') + ')';
            }

            //console.log(createtablequery);
            self.query(createtablequery);
            //console.log('Table ' + table.name + ' initialized');
        });
    };

    self.query = function(query, bindings) {
        bindings = typeof bindings !== 'undefined' ? bindings : [];
        var deferred = $q.defer();
        if (window.cordova) {
            $cordovaSQLite.execute(self.db, query, bindings).then(function(result) {
                deferred.resolve(result);
            }, function(err) {
                deferred.reject(err);
            });
        } else {
            self.db.transaction(function(transaction) {
                transaction.executeSql(query, bindings, function(transaction, result) {
                    deferred.resolve(result);
                }, function(transaction, error) {
                    deferred.reject(error);
                });
            });
        }

        return deferred.promise;
    };

    self.fetchAll = function(result) {
        var output = [];

        for (var i = 0; i < result.rows.length; i++) {
            output.push(result.rows.item(i));
        }

        return output;
    };

    self.fetch = function(result) {
        return result.rows.item(0);
    };

    return self;
})

.factory('UserService', function($q, $cordovaSQLite, DB) {
    var self = this;

    self.findallusers = function() {
        var users = [];
        findallusersquery = 'SELECT usr_id, usr_name FROM usr';
        return DB.query(findallusersquery).then(function(result) {
            resultrows = DB.fetchAll(result);
            for (var i = 0; i < resultrows.length; i++) {
                user_temp = {};
                user_temp.id = resultrows[i].usr_id;
                user_temp.name = resultrows[i].usr_name;
                users.push(user_temp)
            }
            return users;
        });
    };
    self.findbyid = function(usr_id) {
        finduserbyid = 'SELECT usr_id, usr_name FROM usr where usr_id=(?)';
        return DB.query(finduserbyid, [usr_id]).then(function(result) {
            resultrow = DB.fetch(result);
            user_temp = {};
            user_temp.id = resultrow.usr_id;
            user_temp.name = resultrow.usr_name;
            return user_temp;
        });
    };
    self.findnamebyid = function(usr_id) {
        findusernamebyid = 'SELECT usr_name FROM usr where usr_id=(?)';
        return DB.query(findusernamebyid, [usr_id]).then(function(result) {
            resultrow = DB.fetch(result);
            return resultrow.usr_name;
        });
    };
    self.findgroups = function(usr_id) {
        var groups = [];
        findgroupsforuser = 'SELECT grp_id, grp_name FROM grp WHERE  grp_id in (SELECT grp_id from grp_usr WHERE usr_id=(?))';
        return DB.query(findgroupsforuser, [usr_id]).then(function(result) {
            resultrows = DB.fetchAll(result);
            for (var i = 0; i < resultrows.length; i++) {
                temp = {};
                temp.id = resultrows[i].grp_id;
                temp.name = resultrows[i].grp_name;
                groups.push(temp)
            }
            return groups;
        });
    };
    self.findpayments = function(usr_id) {
        var payments = [];
        findpaymentsforuser = 'SELECT paid_id, exp_id, exp_name, paid_amt, exp_amt, grp_name  from paidby INNER JOIN exp ON paidby.paid_exp=exp.exp_id INNER JOIN grp ON exp_grp=grp_id where paid_usr=(?)';
        return DB.query(findpaymentsforuser, [usr_id]).then(function(result) {
            resultrows = DB.fetchAll(result);
            for (var i = 0; i < resultrows.length; i++) {
                temp = {};
                temp.paid_id = resultrows[i].paid_id;
                temp.exp_id = resultrows[i].exp_id;
                temp.exp_name = resultrows[i].exp_name;
                temp.paid_amt = resultrows[i].paid_amt;
                temp.exp_amt = resultrows[i].exp_amt;
                temp.grp_name = resultrows[i].grp_name;
                payments.push(temp)
            }
            return payments;
        });
    };
    self.findspends = function(usr_id) {
        var spends = [];
        findspendsforuser = 'SELECT applicable_id,applicable_amt, exp_id, exp_name, exp_amt, grp_name  from applicableto INNER JOIN exp ON applicableto.applicable_exp=exp.exp_id INNER JOIN grp ON exp_grp=grp_id where applicable_usr=(?)';
        return DB.query(findspendsforuser, [usr_id]).then(function(result) {
            resultrows = DB.fetchAll(result);
            for (var i = 0; i < resultrows.length; i++) {
                temp = {};
                temp.applicable_id = resultrows[i].applicable_id;
                temp.exp_id = resultrows[i].exp_id;
                temp.exp_name = resultrows[i].exp_name;
                temp.applicable_amt = resultrows[i].applicable_amt;
                temp.exp_amt = resultrows[i].exp_amt;
                temp.grp_name = resultrows[i].grp_name;
                spends.push(temp)
            }
            return spends;
        });
    };
    self.addnewuser = function(usr_data) {
        var deferred = $q.defer();
        addgroupquery = "INSERT INTO usr (usr_name) VALUES (?)";
        return DB.query(addgroupquery, [usr_data.name]).then(function(result) {
            if (usr_data.groups) {
                groupids = usr_data.groups.split(";");
                for (var i = 0; i < usr_data.groups.split(";").length; i++) {
                    if (groupids[i] !== "") {
                        var query = "INSERT INTO grp_usr (grp_id,usr_id) VALUES (?,?)";
                        DB.query(query, [groupids[i], result.insertId]).then(function(res) {
                            //console.log (res.insertId +'--'+userids[i]+'--->'res.insertid)
                        })
                    }
                    deferred.resolve(result.insertId);
                }
            } else {
                deferred.resolve(result.insertId);
            }
        }, function(err) {
            deferred.reject(err);
        });
    };
    self.edituser = function(usr_data) {
        var deferred = $q.defer();
        updateusernamequery = "update usr set usr_name = (?) where usr_id=(?)";
        return DB.query(updateusernamequery, [usr_data.name, usr_data.id]).then(function(result) {
            if (usr_data.groups) {
                groupids = usr_data.groups.split(";");
                for (var i = 0; i < usr_data.groups.split(";").length; i++) {
                    if (groupids[i] !== "") {
                        var query = "INSERT INTO grp_usr (grp_id,usr_id) VALUES (?,?)";
                        DB.query(query, [groupids[i], usr_data.id]).then(function(res) {
                            //console.log (res.insertId +'--'+userids[i]+'--->'res.insertid)
                            deferred.resolve(res.insertId);
                        })
                    }
                    // deferred.resolve(result.rowsaffected);
                }
            } else {
                deferred.resolve(result.rowsaffected);
            }
        }, function(err) {
            deferred.reject(err);
        });
    };
    self.findsettlementtotals = function(usr_id) {
        settlementstotal = {}
        getsettlements_totals = "select (select IFNULL(sum(settlement_amt),0)  from settlements where settlement_from_usr=(?)) as settlement_amt_made, (select IFNULL(sum(settlement_amt),0)  from settlements where settlement_to_usr=(?)) as settlement_amt_recieved";
        return DB.query(getsettlements_totals, [usr_id, usr_id]).then(function(result) {
            resultrow = DB.fetch(result);
            settlementstotal.made = resultrow.settlement_amt_made;
            settlementstotal.recieved = resultrow.settlement_amt_recieved;
            return settlementstotal;
        });
    };

    self.findsettlements = function(usr_id) {
        var settlements = [];
        getsettlementsofgrp = 'select settlement_from_usr as settlement_from_id, (select usr_name from usr where usr_id=settlement_from_usr) as settlement_from_name, settlement_amt,settlement_to_usr as settlement_to_id, (select usr_name from usr where usr_id=settlement_to_usr) as settlement_to_name, settlement_grp ,(select grp_name from grp where grp_id=settlement_grp) as settlement_grp_name  from settlements where settlement_from_usr=(?) or settlement_to_usr=(?)';
        return DB.query(getsettlementsofgrp, [usr_id, usr_id]).then(function(result) {
            resultrows = DB.fetchAll(result);
            for (var i = 0; i < resultrows.length; i++) {
                temp = {};
                from = {};
                from.id = resultrows[i].settlement_from_id;
                from.name = resultrows[i].settlement_from_name;
                to = {};
                to.id = resultrows[i].settlement_to_id;
                to.name = resultrows[i].settlement_to_name;
                temp.from = from;
                temp.to = to;
                temp.amount = resultrows[i].settlement_amt;
                group = {}
                group.id = resultrows[i].settlement_grp;
                group.name = resultrows[i].settlement_grp_name;
                temp.group = group
                settlements.push(temp)
            }
            return settlements;
        });
    }

    self.deleteusers = function(usr_list) {
        deleteusersquery = "delete from usr where usr_id=(?)";
        angular.forEach(usr_list, function(user) {
            DB.query(deleteusersquery, [user.id]).then(function(result) {
                //console.log("deleted" + user.name)
            });
        });
    }

    self.deleteuser = function(usr_id) {
        deleteusersquery = "delete from usr where usr_id=(?)";
        return DB.query(deleteusersquery, [usr_id]).then(function(result) {
                return result;
            });
    }

    self.checktransactions = function(usr, grp_id) {
        getnumtraxns = 'select count() as num_trx from (select * from paidby INNER JOIN exp ON paid_exp=exp_id   UNION select * from applicableto INNER JOIN exp ON applicable_exp=exp_id ) where exp_grp=(?) and paid_usr=(?)';
        return DB.query(getnumtraxns, [grp_id, usr.id]).then(function(result) {
            resultrow = DB.fetch(result);
            count = resultrow.num_trx;
            return count;

        })
    }
    return self;


})

.factory('GroupService', function($q, $cordovaSQLite, DB, ExpenseService) {

        var self = this;
        self.findallgroups = function() {
            var groups = [];
            findallgroupssquery = 'SELECT grp_id, grp_name FROM grp';
            return DB.query(findallgroupssquery).then(function(result) {
                //console.log(result);
                resultrows = DB.fetchAll(result);
                for (var i = 0; i < resultrows.length; i++) {
                    group_temp = {};
                    group_temp.id = resultrows[i].grp_id;
                    group_temp.name = resultrows[i].grp_name;
                    groups.push(group_temp)
                }
                return groups;
            });
        };
        self.findusers = function(grp_id) {
            var users = [];
            findgusersforgrp = 'SELECT usr_id, usr_name FROM usr WHERE  usr_id in (SELECT usr_id from grp_usr WHERE grp_id=(?))';
            return DB.query(findgusersforgrp, [grp_id]).then(function(result) {
                resultrows = DB.fetchAll(result);
                for (var i = 0; i < resultrows.length; i++) {
                    temp = {};
                    temp.id = resultrows[i].usr_id;
                    temp.name = resultrows[i].usr_name;
                    users.push(temp)
                }
                return users;
            });
        };
        self.deletegrp = function(grp_id) {
            deletegrpquery = 'delete FROM grp where grp_id=(?)';
            deleteuserassociations = 'delete FROM grp_usr where grp_id=(?)';
            deleteexpensesofgrp = 'delete FROM exp where exp_grp=(?)';
            deletepaidbyentries = 'delete FROM paidby where paid_exp in ( select exp_id from exp where exp_grp=(?))';
            deleteapplicabletoentries = 'delete FROM applicableto where applicable_exp in ( select exp_id from exp where exp_grp=(?))';
            deletesettlements = 'delete from settlements where settlement_grp=(?)';
            cleanup_applicable = 'delete FROM applicableto where applicable_exp not in (select exp_id from exp)';
            cleanup_paidby = 'delete FROM paidby where paid_exp not in (select exp_id from exp)';
            querylistfordeletegrp = [deletepaidbyentries, deleteapplicabletoentries, deletesettlements, deleteuserassociations, deletegrpquery, deleteexpensesofgrp, cleanup_applicable, cleanup_paidby];

            /*DB.query(deleteexpensesofgrp, [grp_id]).then(function() {
                DB.query(cleanup_paidby).then(function() {});
                DB.query(cleanup_applicable).then(function() {});
            });
            DB.query(deletesettlements, [grp_id]).then(function(result) {
                DB.query(deleteuserassociations, [grp_id]).then(function(result) {
                        DB.query(deletegrpquery, [grp_id]).then(function(result) {
                        })
                })
            })*/



            var tasks = querylistfordeletegrp.map(function(query) {
                return function() {
                    return DB.query(query, [grp_id]);
                };
            });
            $q.serial(tasks);
        };
        self.getuserswhocanbedeleted = function(grp_id) {
            users_whocanbdeleted = [];
            getgrpsofuserquery = 'SELECT grp_id from grp_usr WHERE usr_id=(?)';
            return self.findusers(grp_id).then(function(users) {
                angular.forEach(users, function(user) {
                    DB.query(getgrpsofuserquery, [user.id]).then(function(result) {
                        resultrows = DB.fetchAll(result);
                        if (resultrows.length == 1)
                            users_whocanbdeleted.push(user);
                    });
                });
                return users_whocanbdeleted;
            })
        };
        self.findexpenses = function(grp_id) {
            var expsenses = [];
            findgusersforgrp = 'SELECT exp_id, exp_name, exp_amt ,GROUP_CONCAT(usr_name) as payers FROM paidby INNER JOIN usr ON paid_usr=usr_id INNER JOIN exp ON paid_exp=exp_id  Where exp_grp=(?) GROUP BY exp_id';
            return DB.query(findgusersforgrp, [grp_id]).then(function(result) {
                resultrows = DB.fetchAll(result);
                for (var i = 0; i < resultrows.length; i++) {
                    temp = {};
                    temp.id = resultrows[i].exp_id;
                    temp.name = resultrows[i].exp_name;
                    temp.amount = resultrows[i].exp_amt;
                    temp.payers = resultrows[i].payers;
                    expsenses.push(temp)
                }
                return expsenses;
            });
        };
        self.findsettlements = function(grp_id) {
            var settlements = [];
            getsettlementsofgrp = 'select settlement_from_usr as settlement_from_id, (select usr_name from usr where usr_id=settlement_from_usr) as settlement_from_name, settlement_amt,settlement_to_usr as settlement_to_id, (select usr_name from usr where usr_id=settlement_to_usr) as settlement_to_name   from settlements where settlement_grp=(?)';
            return DB.query(getsettlementsofgrp, [grp_id]).then(function(result) {
                resultrows = DB.fetchAll(result);
                for (var i = 0; i < resultrows.length; i++) {
                    temp = {};
                    from = {};
                    from.id = resultrows[i].settlement_from_id;
                    from.name = resultrows[i].settlement_from_name;
                    to = {};
                    to.id = resultrows[i].settlement_to_id;
                    to.name = resultrows[i].settlement_to_name;
                    temp.from = from;
                    temp.to = to;
                    temp.amount = resultrows[i].settlement_amt;
                    settlements.push(temp)
                }
                return settlements;
            });
        }
        self.findtotalexpenses = function(grp_id) {

            findgusersforgrp = 'SELECT sum(exp_amt) as total_exp FROM exp Where exp_grp=(?)';
            return DB.query(findgusersforgrp, [grp_id]).then(function(result) {
                resultrow = DB.fetch(result);

                return resultrow.total_exp;
            });
        };
        self.findbyid = function(grp_id) {
            findgroupbyid = 'SELECT grp_id, grp_name FROM grp where grp_id=(?)';
            return DB.query(findgroupbyid, [grp_id]).then(function(result) {
                resultrow = DB.fetch(result);
                temp = {};
                temp.id = resultrow.grp_id;
                temp.name = resultrow.grp_name;
                return temp;
            });
        };
        self.findnamebyid = function(grp_id) {
            findgroupnamebyid = 'SELECT grp_name FROM grp where grp_id=(?)';
            return DB.query(findgroupnamebyid, [grp_id]).then(function(result) {
                resultrow = DB.fetch(result);
                return resultrow.grp_name;
            });
        };

        self.addnewgroup = function(grp_data) {
            var deferred = $q.defer();
            addgroupquery = "INSERT INTO grp (grp_name) VALUES (?)";
            return DB.query(addgroupquery, [grp_data.name]).then(function(result) {
                if (grp_data.users) {
                    userids = grp_data.users.split(";");
                    for (var i = 0; i < grp_data.users.split(";").length; i++) {
                        if (userids[i] !== "") {
                            var query = "INSERT INTO grp_usr (grp_id,usr_id) VALUES (?,?)";
                            DB.query(query, [result.insertId, userids[i]]).then(function(res) {
                                //console.log (res.insertId +'--'+userids[i]+'--->'res.insertid)
                            })
                        }
                        deferred.resolve(result.insertId);
                    }
                } else {
                    deferred.resolve(result.insertId);
                }
            }, function(err) {
                deferred.reject(err);
            });
        };

        self.editgroup = function(grp_data) {
            var deferred = $q.defer();
            updategroupnamequery = "update grp set grp_name = (?) where grp_id=(?)";;
            return DB.query(updategroupnamequery, [grp_data.name, grp_data.id]).then(function(result) {
                if (grp_data.users) {
                    userids = grp_data.users.split(";");
                    for (var i = 0; i < grp_data.users.split(";").length; i++) {
                        if (userids[i] !== "") {
                            var query = "INSERT INTO grp_usr (grp_id,usr_id) VALUES (?,?)";
                            DB.query(query, [grp_data.id, userids[i]]).then(function(res) {
                                //console.log (res.insertId +'--'+userids[i]+'--->'res.insertid)
                            })
                        }
                    }
                    if (grp_data.userstoberemoved){
                        angular.forEach(grp_data.userstoberemoved,function(user) {
                            var query = "delete FROM grp_usr where grp_id=(?) and usr_id=(?)";
                            DB.query(query, [grp_data.id, user.id]).then(function(res) {
                            })
                        });

                    }
                    deferred.resolve(result.rowsaffected);
                } else {
                    deferred.resolve(result.rowsaffected);
                }
            }, function(err) {
                deferred.reject(err);
            });
        };

        self.getusergroupswithmembers = function(usr_id) {
            var usr_groups = {};
            getgrps_usr = "Select grp_id from grp_usr where usr_id=(?)";
            return DB.query(getgrps_usr, [usr_id]).then(function(result) {
                resultrows = DB.fetchAll(result);
                angular.forEach(resultrows, function(row) {
                    self.findusers(row.grp_id).then(function(grp_users) {
                        tmp = {};
                        tmp.grp_id = row.grp_id;
                        tmp.grp_users = grp_users;
                        usr_groups[tmp.grp_id] = tmp;
                    })
                })
                return usr_groups;
            });
        };
        return self;


    })
    .factory('ExpenseService', function($q, $cordovaSQLite, DB) {

        var self = this;
        self.findallexpenses = function() {
            var expenses = [];
            findallexpenseids = 'SELECT exp_id FROM exp';
            return DB.query(findallexpenseids).then(function(result) {
                resultrows = DB.fetchAll(result);
                for (var i = 0; i < resultrows.length; i++) {
                    self.findexpensebyid(resultrows[i].exp_id).then(function(exp_temp) {
                        expenses.push(exp_temp)
                    })
                }
                return expenses;
            });
        };
        self.findexpensebyid = function(expense_id) {
            findexpensebyidquery = 'SELECT exp_id, exp_name, exp_amt, exp_date, exp_grp FROM exp WHERE exp_id = (?)';

            return DB.query(findexpensebyidquery, [expense_id]).then(function(result) {
                resultrow = DB.fetch(result);
                temp = {};
                temp.id = resultrow.exp_id;
                temp.detail = resultrow.exp_name;
                temp.amount = resultrow.exp_amt;
                temp.taggedgroup = resultrow.exp_grp;
                temp.date = Date.parse(resultrow.exp_date);
                return temp;
            });
        };
        self.findtotalspendsofuser = function(user_id) {
            findspendsbyidquery = 'SELECT IFNULL(sum(applicable_amt),0) as total_spends from applicableto where applicable_usr=(?)';
            return DB.query(findspendsbyidquery, [user_id]).then(function(result) {
                resultrow = DB.fetch(result);
                temp = resultrow.total_spends;
                return temp;
            });
        };
        self.findtotalpaymentsofuser = function(user_id) {
            findpaymentsbyidquery = 'SELECT IFNULL(sum(paid_amt),0) as total_paid from paidby where paid_usr=(?)';
            return DB.query(findpaymentsbyidquery, [user_id]).then(function(result) {
                resultrow = DB.fetch(result);
                temp = resultrow.total_paid;
                return temp;
            });
        };
        self.findtotalspendsofuser_grp = function(user_id, grp_id) {
            findspendsbyidquery = 'SELECT IFNULL(sum(applicable_amt),0) as total_spends from applicableto INNER JOIN exp ON applicable_exp=exp_id where applicable_usr=(?) and exp_grp=(?)';
            return DB.query(findspendsbyidquery, [user_id, grp_id]).then(function(result) {
                resultrow = DB.fetch(result);
                temp = resultrow.total_spends;
                return temp;
            });
        };
        self.findtotalpaymentsofuser_grp = function(user_id, grp_id) {
            findpaymentsbyidquery = 'SELECT IFNULL(sum(paid_amt),0) as total_paid from paidby INNER JOIN exp ON paid_exp=exp_id where paid_usr=(?) and exp_grp=(?)';
            return DB.query(findpaymentsbyidquery, [user_id, grp_id]).then(function(result) {
                resultrow = DB.fetch(result);
                temp = resultrow.total_paid;
                return temp;
            });
        };
        self.findtotalsettlement_paidofuser_grp = function(user_id, grp_id) {
            findtotalsettlement_paid_query = 'SELECT IFNULL(sum(settlement_amt),0) as settlementamont_paid FROM settlements where settlement_from_usr=(?) and settlement_grp=(?)';
            return DB.query(findtotalsettlement_paid_query, [user_id, grp_id]).then(function(result) {
                resultrow = DB.fetch(result);
                temp = resultrow.settlementamont_paid;
                return temp;
            });
        };
        self.findtotalsettlement_recievedofuser_grp = function(user_id, grp_id) {
            findtotalsettlement_recieved_query = 'SELECT IFNULL(sum(settlement_amt),0) as settlementamont_recieved FROM settlements where settlement_to_usr=(?) and settlement_grp=(?)';
            return DB.query(findtotalsettlement_recieved_query, [user_id, grp_id]).then(function(result) {
                resultrow = DB.fetch(result);
                temp = resultrow.settlementamont_recieved;
                return temp;
            });
        };
        self.findexpensedetailsbyid = function(expense) {
            var paiddefer = $q.defer();
            self.findpayersbyexpid(expense.id).then(function(contrib_temp) {
                expense.contrib = contrib_temp;
            }).then(function() {
                self.findapplicablesbyexpid(expense.id).then(function(applicable_temp) {
                    expense.applicable = applicable_temp;
                    paiddefer.resolve(expense);
                });
            })
            return paiddefer.promise;
        };
        self.findpayersbyexpid = function(expense_id) {
            var contrib_temp = [];
            findallpayees = 'SELECT paid_usr, paid_amt FROM paidby WHERE paid_exp=(?)';
            return DB.query(findallpayees, [expense_id]).then(function(result) {
                paidbyrows = DB.fetchAll(result);
                for (var i = 0; i < paidbyrows.length; i++) {
                    paid_temp = {}
                    paid_temp.payee = paidbyrows[i].paid_usr;
                    paid_temp.amount = paidbyrows[i].paid_amt;
                    contrib_temp.push(paid_temp);
                }
                return contrib_temp;
            })
        };
        self.findapplicablesbyexpid = function(expense_id) {
            var applicable_temp = [];
            findallapplicables = 'SELECT applicable_usr, applicable_amt FROM applicableto WHERE applicable_exp=(?)';
            return DB.query(findallapplicables, [expense_id]).then(function(result) {
                applicablerows = DB.fetchAll(result);
                for (var i = 0; i < applicablerows.length; i++) {
                    app_temp = {}
                    app_temp.payee = applicablerows[i].applicable_usr;
                    app_temp.amount = applicablerows[i].applicable_amt;
                    applicable_temp.push(app_temp);
                }
                return applicable_temp;
            });
        };
        self.addnewexpense = function(exp_data) {
            var deferred = $q.defer();
            addexpensequery = "INSERT INTO exp (exp_name,exp_amt,exp_date,exp_grp) VALUES (?,?,?,?)";
            addspentbyquery = "INSERT INTO paidby (paid_usr,paid_amt,paid_exp) VALUES (?,?,?)";
            addapplicabletoquery = "INSERT INTO applicableto (applicable_usr,applicable_amt,applicable_exp) VALUES (?,?,?)"
            return DB.query(addexpensequery, [exp_data.detail, exp_data.amount, new Date(exp_data.date), exp_data.taggedgroup]).then(function(result) {
                if (exp_data.contrib && exp_data.applicable) {
                    for (var i = 0; i < exp_data.contrib.length; i++) {
                        DB.query(addspentbyquery, [exp_data.contrib[i].payee, exp_data.contrib[i].amount, result.insertId]).then(function(res1) {
                            console.log('addition to spent by ' + '--->' + res1.insertid)
                        });
                    }
                    for (var j = 0; j < exp_data.applicable.length; j++) {
                        DB.query(addapplicabletoquery, [exp_data.applicable[j].payee, exp_data.applicable[j].amount, result.insertId]).then(function(res2) {
                            console.log('addition to applicable to ' + '--->' + res2.insertid)
                        });

                    }
                    return result.insertId;
                }
            }, function(err) {
                deferred.reject(err);
            });
        };
        self.deleteexpense = function(exp_id) {
            var deferred = $q.defer();
            deleteexpensequery = "DELETE FROM exp where exp_id=(?)";
            deleteexpensequery_paidby = "DELETE FROM paidby where paid_exp=(?)";
            deleteexpensequery_applicableto = "DELETE FROM applicableto where applicable_exp=(?)"
            return DB.query(deleteexpensequery, [exp_id]).then(function(result) {
                return DB.query(deleteexpensequery_paidby, [exp_id]).then(function(result) {
                    return DB.query(deleteexpensequery_applicableto, [exp_id]).then(function(result) {});
                });
            });
        };
        self.addsettlement = function(settlement_data) {
            addsettlementquery = "INSERT INTO settlements (settlement_from_usr,settlement_to_usr,settlement_amt,settlement_grp) Values (?,?,?,?)"
            return DB.query(addsettlementquery, [settlement_data.from.id, settlement_data.to.id, settlement_data.amt, settlement_data.grp.id]).then(function() {
                return;
            })
        }
        return self;


    });