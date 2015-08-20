angular.module('starter.controllers').controller('expensecontrol', function($scope,$filter, $state, $ionicModal, $cordovaToast, $ionicPopup, $timeout, UserService, GroupService, ExpenseService) {
    $scope.$on('$ionicView.enter', function() {
        UserService.findallusers().then(function(users){
            $scope.users = users;
        })
        GroupService.findallgroups().then(function(groups){
            $scope.groups = groups;
        })
        ExpenseService.findallexpenses().then(function(expenses){
            $scope.expenses = expenses;
            $timeout(function() {
                $scope.groupedexpenses = _.chain($scope.expenses).groupBy('date').pairs().sortBy(0).value().reverse();
            }, 500);
            
        })

    })
   
    $scope.place_tagto = 'select . .';
    $scope.expensedata = {};
    $scope.place_spentby = "select . .";
    $scope.place_applicableto = "select . .";
    $scope.formdata = {};
    $scope.shouldShowDelete = false;
    $scope.listCanSwipe = true;
    $scope.expensedata.date=new Date(new Date().toJSON().slice(0, 10));
    $scope.setusers = function(groupid){
        GroupService.findusers(groupid).then(function(users){
            $scope.users = users;
        })
    }

    $scope.getgroupname=function(id){
        result = $scope.groups.filter(function(obj) {
                        return obj.id == id;
                    });
        return result[0].name;
    }
    $scope.getusername=function(id){
        result = $scope.users.filter(function(obj) {
                        return obj.id == id;
                    });
        return result[0].name;
    }
    $scope.transform = function(item) {
        item.taggedgroup_name = $scope.getgroupname(item.taggedgroup);
        return true;
    };

    /* Select spenders */
    $scope.slectspenders = function(form) {
        $ionicModal.fromTemplateUrl('templates/selectspenders.html', function(modal) {
            $scope.totalamt = form.amount.$modelValue;
            $scope.selectspendersmodal = modal;
            $scope.selectspendersmodal.show();
        }, {
            scope: $scope
        });
    };
    $scope.hidespenders = function() {
        $scope.selectspendersmodal.hide();
        $scope.formdata.contrib = {};
    }
    $scope.showaddexpensemodal = function() {
        $ionicModal.fromTemplateUrl('templates/addexpensemodal.html', function(modal) {
            $scope.addexpensemodal = modal;
            $scope.addexpensemodal.show();
        }, {
            scope: $scope
        });
    }
    $scope.hideaddexpensemodal = function() {
        $scope.addexpensemodal.hide();
    }
    $scope.slectapplicable = function() {
        $ionicModal.fromTemplateUrl('templates/selectapplicable.html', function(modal) {
            $scope.selectapplicablemodal = modal;
            $scope.selectapplicablemodal.show();
        }, {
            scope: $scope
        });
    }
    $scope.hideapplicable = function() {

        $scope.selectapplicablemodal.hide();
    }
    
    $scope.addexpense = function(addexpenseform) {
        if(addexpenseform.$valid && $scope.expensedata.contrib != undefined && $scope.expensedata.contrib.length!=0 && $scope.expensedata.applicable != undefined && $scope.expensedata.applicable.length!=0)
        {
            $scope.hideaddexpensemodal();
            var p1 =ExpenseService.addnewexpense($scope.expensedata);
            p1.then(function(val) {
            console.log('Doing addexpense', $scope.expensedata);
            console.log('Doing addexpense', $scope.expensedata.contrib);
            $scope.expensedata = {};
            $scope.formdata = {};
            $scope.place_spentby = "Select . .";
            $scope.place_applicableto = "Select . .";
            var myPopup = $ionicPopup.show({
                    template: '',
                    title: 'Add Expense',
                    subTitle: 'Expense added successfully !'
                })
                myPopup.then(function(res) {
                });

                $timeout(function() {
                    myPopup.close();
                }, 1000);
            }); 
        }
        
    };
    $scope.$on('modal.hidden', function() {
        $timeout( function() {
            ExpenseService.findallexpenses().then(function(expenses){
            $scope.expenses = expenses;
            $timeout(function() {
                $scope.groupedexpenses = _.chain($scope.expenses).groupBy('date').pairs().sortBy(0).value().reverse();
            }, 500);
            })
            $scope.$broadcast('scroll.refreshComplete');
        }, 1000);;
    })
    $scope.gettotal = function(formdata) {
        var total = 0;
        var obj = formdata;
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop) && obj[prop] !== null) {
                total = total + parseFloat(obj[prop]);
            }
        }
        return total;
    };


    $scope.validateSinglepayer = function(item) {

        $scope.expensedata.contrib = [{
            payee: item.id,
            amount: $scope.totalamt
        }];
        $scope.place_spentby = item.name;
        $scope.hidespenders();
    };

    $scope.validatetaggedgroup = function(item) {
        $scope.expensedata.taggedgroup = item.id
        $scope.place_tagto = item.name;
        $scope.hidetagtogroup();
    };

    $scope.validatecontribtotal = function(jq) {
        var remain = parseFloat($(jq).text())
        if (remain < 0.01 && remain >= 0) {
            return true;

        } else {
            return false;
        }

    };

    $scope.validateMultiplepayers = function() {

        var totalvalid = $scope.validatecontribtotal("span#rem");
        if (totalvalid) {
            $scope.expensedata.contrib = [];
            var userstring = "";
            for (var c in $scope.formdata.contrib) {
                if ($scope.formdata.contrib.hasOwnProperty(c) && $scope.formdata.contrib[c] !== null && $scope.formdata.contrib[c] !== 0) {
                    contribution = {
                        payee: c,
                        amount: $scope.formdata.contrib[c]
                    }
                    result = $scope.users.filter(function(obj) {
                        return obj.id == c;
                    });
                    userstring = userstring + " " + result[0].name;
                    $scope.expensedata.contrib.push(contribution)


                }

            }
            $scope.hidespenders();
            $scope.place_spentby = userstring;
        } else {
            console.log("please adjust bill mount among payees, remaining amount should be 0");
            $scope.showToast("please adjust bill mount among payees, remaining amount should be 0", "short", "middle");
        }
    };

    
    $scope.validateapplicable_equal = function() {
        $scope.expensedata.applicable = [];
            var userstring = "";
            var applicable_num = $scope.getnumberofapplicable();
            totalamount = $scope.expensedata.amount;
            for (var c in $scope.formdata.applicableequally) {
                if ($scope.formdata.applicableequally.hasOwnProperty(c) && $scope.formdata.applicableequally[c] !== null &&$scope.formdata.applicableequally[c] !== false && $scope.formdata.applicableequally[c] !== 0) {
                    applicable = {
                        payee: c,
                        amount: (totalamount/applicable_num)
                    }
                    result = $scope.users.filter(function(obj) {
                        return obj.id == c;
                    });
                    userstring = userstring + " " + result[0].name;
                    $scope.expensedata.applicable.push(applicable)


                }

            }
            $scope.hideapplicable();
            $scope.place_applicableto = userstring;
        //console.log($scope.formdata.applicableequally)
    };

    $scope.validateapplicable_unequal = function() {
        var totalvalid = $scope.validatecontribtotal("span#apprem");
        if (totalvalid) {
            $scope.expensedata.applicable = [];
            var userstring = "";
            for (var c in $scope.formdata.applicableunequally) {
                if ($scope.formdata.applicableunequally.hasOwnProperty(c) && $scope.formdata.applicableunequally[c] !== null && $scope.formdata.applicableunequally[c] !== 0) {
                    applicable = {
                        payee: c,
                        amount: $scope.formdata.applicableunequally[c]
                    }
                    result = $scope.users.filter(function(obj) {
                        return obj.id == c;
                    });
                    userstring = userstring + " " + result[0].name;
                    $scope.expensedata.applicable.push(applicable)


                }

            }
            $scope.hideapplicable();
            $scope.place_applicableto = userstring;
        } else {
            console.log("please adjust bill mount among applicable, remaining amount should be 0");
            $scope.showToast("please adjust bill amount among applicable, remaining amount should be 0", "short", "middle");
        }

        console.log($scope.expensedata.applicable)
    };

    $scope.getnumberofapplicable = function() {
        count = 0;
        if ($scope.formdata.applicableequally) {
            keysarray = Object.keys($scope.formdata.applicableequally);
            if (keysarray.length > 0) {
                for (i = 0; i < keysarray.length; i++) {
                    if ($scope.formdata.applicableequally[keysarray[i]])
                        count = count + 1;
                }
            }

        }
        return count;
    }

    $scope.applicableperuser = function() {
        c = $scope.getnumberofapplicable();
        if (c === 0)
            return 0;
        else
        {
            if($scope.expensedata.amount)
                return $scope.expensedata.amount / c;
            else
                return 0;
        }
    }
    $scope.checkall = function() {
        
        var tempformdata_applicableequally ={}
        for( i in $scope.users)
        {
            var id = $scope.users[i].id;
            tempformdata_applicableequally[id] =true;
        }
        $scope.formdata.applicableequally=tempformdata_applicableequally;
    }

    $scope.uncheckall = function() {
       var tempformdata_applicableequally ={}
        for( i in $scope.users)
        {
            var id = $scope.users[i].id;
            tempformdata_applicableequally[id] =false;
        }
        $scope.formdata.applicableequally=tempformdata_applicableequally;
    }
})

.controller('expensedetailcontroltrl', function ($scope,$state,$ionicModal, $stateParams,$ionicActionSheet, $controller, ExpenseService, UserService, GroupService) {
    $scope.$on('$ionicView.enter', function() {
        GroupService.findallgroups().then(function(groups){
            $scope.groups = groups;
        })
        ExpenseService.findexpensebyid($stateParams.expenseId).then(function(expense) {
            p=ExpenseService.findexpensedetailsbyid(expense);
            p.then(function(expensedetail){
            $scope.expensedata=expensedetail;
             $scope.expensedata.date=new Date(expense.date);
             GroupService.findusers(expensedetail.taggedgroup).then(function(users){
            $scope.users = users;
        })
            });
        });
    });
    $scope.getusername=function(id){
        if($scope.users)
        {
            result = $scope.users.filter(function(obj) {
                        return obj.id == id;
                    });
            if(result[0])
            {return result[0].name;}
        }
    }
    $scope.getgroupname=function(id){
        if($scope.groups)
        {
         result = $scope.groups.filter(function(obj) {
                        return obj.id == id;
                    });
         if(result[0])
            {return result[0].name;}
           
        }
    }
     $scope.toggleGroup = function(expense) {
    if ($scope.isGroupShown(expense)) {
      $scope.shownGroup = null;
    } else {
      $scope.shownGroup = expense;
    }
  };
  $scope.isGroupShown = function(expense) {
    return $scope.shownGroup === expense;
  };
  $scope.deleteexpense = function(expenseid) {
    ExpenseService.deleteexpense(expenseid).then(function(){
        $state.go("app.listexpenses")
    })
  }
  $scope.showeditexpensemodal = function(expenseid) {
    $ionicModal.fromTemplateUrl('templates/editexpensemodal.html', function(modal) {
            $scope.editexpensemodal = modal;
            $scope.editexpensedata = $scope.expensedata;
            $scope.editexpensedata.place_applicableto = $scope.getapplicablestring();
            $scope.editexpensedata.place_spentby = $scope.getpayersstring();
            //build formdata.applicableequally
            //build formdata.applicableunequally
            //build $scope.formdata.contribs
            $scope.editexpensemodal.show();
        }, {
            scope: $scope
        });
  }
  $scope.hideeditexpensemodal = function(expenseid) {
    $scope.editexpensemodal.hide();
  }
  $scope.getpayersstring = function() {
    var userstring="";
    for(con in $scope.expensedata.contrib)
    {
        userstring = userstring + " "+$scope.getusername($scope.expensedata.contrib[con].payee)
    }
    return userstring;
  }
  $scope.getapplicablestring = function() {
    var userstring="";
    for(app in $scope.expensedata.applicable)
    {
        userstring = userstring + " "+$scope.getusername($scope.expensedata.applicable[app].payee)
    }
    return userstring;
  }
  $scope.showActionsheet=function(expense){
        $ionicActionSheet.show({
            titleText: 'Manage',
            buttons: [
                { text: '<i class="icon ion-checkmark-circled"></i> Edit' },
                { text: '<i class="icon ion-ios-checkmark-outline"></i> Delete' },
            ],
            cancelText: 'Cancel',
            cancel: function() {
                console.log('CANCELLED');
            },
            buttonClicked: function(index) {
            if(index==0)
            {
                //edit expense
                $scope.showeditexpensemodal()
            }
            if(index==1)
            {   
                //delete expense
                $scope.deleteexpense($stateParams.expenseId)
            }
        
            return true;
            },
            destructiveButtonClicked: function() {
                console.log('DESTRUCT');
                return true;
            }
        });
    };
});