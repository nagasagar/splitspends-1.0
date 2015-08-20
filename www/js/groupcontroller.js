angular.module('starter.controllers').controller('groupcontrol', function($scope, $ionicModal, $ionicPopup, $cordovaSQLite, $timeout, $state, UserService, GroupService) {
    $scope.$on('$ionicView.enter', function() {
        UserService.findallusers().then(function(users){
            $scope.users = users;
        })
        GroupService.findallgroups().then(function(groups){
            $scope.groups = groups;
        })
    })
    $scope.place_selectusers = 'Select . .';
    $scope.groupdata = {};
    $scope.formdata = {};
    $scope.shouldShowDelete = false;
    $scope.listCanSwipe = true;
    $scope.deletegroup = function(group) {
        console.log('Doing deletegroup', group);
    };
    $scope.getgroupdetails = function(group) {
        console.log('Doing getgroupdetails', group);
    };
    $scope.showaddgroupmodal = function() {
        $ionicModal.fromTemplateUrl('templates/addgroupmodal.html', function(modal) {
            $scope.addgroupmodal = modal;
            $scope.addgroupmodal.show();
        }, {
            scope: $scope
        });
    }
    $scope.hideaddgroupmodal = function() {
        $scope.addgroupmodal.hide();
    }
    $scope.addgroup = function(grp_data) {
        var p1 = GroupService.addnewgroup(grp_data);
        p1.then(function(val) {
        //clearup the form data
        $scope.groupdata = {};
        $scope.formdata = {};
        $scope.place_selectusers = 'Select . .';
        //show popup for successful addition of group
        var myPopup = $ionicPopup.show({
            template: '',
            title: 'Add Group',
            subTitle: 'Group added successfully !'
        })
        myPopup.then(function(res) {

        });
        $timeout(function() {
            myPopup.close(); //close the popup after a second
        }, 1000);
        $scope.hideaddgroupmodal();
        //$state.go("app.listgroups");
        GroupService.findallgroups().then(function(groups){
            $scope.groups = groups;
        })
        })

    };
    
    $scope.showselectusers = function() {
        $ionicModal.fromTemplateUrl('selectusers.html', function(modal) {
            $scope.selectusersmodal = modal;
            $scope.selectusersmodal.show();
        }, {
            scope: $scope
        });
    }

    $scope.hideselectusers = function() {
        $scope.selectusersmodal.hide();
    }

    $scope.validateselectusers = function() {
        $scope.groupdata.users = "";
        var userstring = "";
        var len = 0;
        for (var c in $scope.formdata.selectusers) {
            if ($scope.formdata.selectusers.hasOwnProperty(c) && $scope.formdata.selectusers[c] !== null && $scope.formdata.selectusers[c] !== false && $scope.formdata.selectusers[c] !== 0) {
                len = len + 1;
                $scope.groupdata.users = $scope.groupdata.users + ";" + c;
            }

        }
        //console.log($scope.groupdata.users )
        result = $scope.users.filter(function(obj) {
            return obj.id == $scope.groupdata.users.split(";")[1];
        });
        if (len > 1)
            userstring = result[0].name + " + " + (len - 1) + " more";
        else
            userstring = result[0].name;
        $scope.hideselectusers();
        $scope.place_selectusers = userstring;
        console.log($scope.groupdata.users)
    }

})
.controller('groupdetailcontroltrl', function ($q, $scope, $ionicActionSheet,$ionicPopup,$timeout, $stateParams, GroupService, ExpenseService) {
    $scope.$on('$ionicView.enter', function() {
       
        $scope.getuserbalances()
        GroupService.findbyid($stateParams.groupId).then(function(group) {
            $scope.group = group;

        });
        GroupService.findtotalexpenses($stateParams.groupId).then(function(total_exp) {
            $scope.total_exp = total_exp;

        });

        GroupService.findusers($stateParams.groupId).then(function(users) {
            if(users.length > 0)
            {
                $scope.userstring="";
                for (i=0;i<users.length;i++){
                    $scope.userstring=$scope.userstring+", "+users[i].name;
                }
                $scope.userstring=$scope.userstring.substring(1);
            }
            
        });

        GroupService.findsettlements($stateParams.groupId).then(function(settlements){
            $scope.settlements= settlements;
        });

        GroupService.findexpenses($stateParams.groupId).then(function(exps){
            for (i=0;i<exps.length;i++)
            {
                if(exps[i].payers.split(',').length>1)
                {
                    exps[i].payerstring = exps[i].payers.split(',')[0]+" +"+(exps[i].payers.split(',').length-1)+" more"
                }
                else
                {
                    exps[i].payerstring = exps[i].payers
                }
            }            
                $scope.expenses = exps;
        });
        
        ExpenseService.findtotalpaymentsofuser($stateParams.groupId).then(function(total_payments){
              $scope.total_payments = total_payments;
        });
        ExpenseService.findtotalspendsofuser($stateParams.groupId).then(function(total_spends){
              $scope.total_spends = total_spends;
        });
    })
    $scope.getuserbalances=function(){
         GroupService.findusers($stateParams.groupId).then(function(users) {
            $scope.users = users;
            var oldusers = $scope.users
            angular.forEach(oldusers, function(user) {
                ExpenseService.findtotalpaymentsofuser_grp(user.id,$stateParams.groupId).then(function(paymentsofuser){
                    user.payments=paymentsofuser
                    ExpenseService.findtotalspendsofuser_grp(user.id,$stateParams.groupId).then(function(spendsofuser){
                        user.spends=spendsofuser
                        ExpenseService.findtotalsettlement_paidofuser_grp(user.id,$stateParams.groupId).then(function(settlementamont_paid){
                            user.settlemetnspaid = settlementamont_paid;
                            ExpenseService.findtotalsettlement_recievedofuser_grp(user.id,$stateParams.groupId).then(function(settlementamont_recieved){
                                user.settlemetnsrecieved=settlementamont_recieved;
                                user.balance = (paymentsofuser-spendsofuser+settlementamont_paid-settlementamont_recieved);
                            })
                        })
                    });

                });
            });
           
        });
    }
    $scope.toggleUserEntry = function(user) {
    if ($scope.isUserExpanded(user)) {
      $scope.UserExpanded = null;
    } else {
      $scope.UserExpanded = user;
    }
    };
     $scope.isUserExpanded = function(user) {
    return $scope.UserExpanded === user;
    };
    $scope.togglesearch = function() {
        if ($scope.isSearchbarShown()) {
            $scope.showsearchbar = null;
        } else {
            $scope.showsearchbar = true;
        }
    };
    $scope.isSearchbarShown = function() {
        return $scope.showsearchbar;
    };
    $scope.getsuggestions = function(){
        $scope.balances = []
        $scope.suggestions = []
        for(i=0;i<$scope.users.length;i++)
        {
            balance={}
            balance.user_id = $scope.users[i].id;
            balance.user_name = $scope.users[i].name;
            balance.balance = $scope.users[i].balance;
            $scope.balances.push(balance);
        }
        $scope.balances.sort(function(a,b){
            return a.balance-b.balance;
        })
        balances_temp=$scope.balances;
        balances_temp = balances_temp.filter(function(x){
                return !(Math.abs(x.balance)<0.01)
        })
        while(balances_temp.length>0)
        {
            txn={}
            baltemp = balances_temp[0].balance+balances_temp[balances_temp.length-1].balance
            if(Math.abs(balances_temp[0].balance)>Math.abs(balances_temp[balances_temp.length-1].balance)){
                balances_temp[0].balance = balances_temp[0].balance+balances_temp[balances_temp.length-1].balance;
                txn.from = {id:balances_temp[0].user_id,name:balances_temp[0].user_name}
                txn.to = {id:balances_temp[balances_temp.length-1].user_id,name:balances_temp[balances_temp.length-1].user_name}
                txn.amt = Math.abs(balances_temp[balances_temp.length-1].balance);
                balances_temp[balances_temp.length-1].balance=0;
                $scope.suggestions.push(txn)
            }
            else if(Math.abs(balances_temp[0].balance)<Math.abs(balances_temp[balances_temp.length-1].balance)){
                balances_temp[balances_temp.length-1].balance = balances_temp[0].balance+balances_temp[balances_temp.length-1].balance;
                txn.from = {id:balances_temp[0].user_id,name:balances_temp[0].user_name}
                txn.to = {id:balances_temp[balances_temp.length-1].user_id,name:balances_temp[balances_temp.length-1].user_name}
                txn.amt = Math.abs(balances_temp[0].balance);
                balances_temp[0].balance=0;
                $scope.suggestions.push(txn)
            }
            else{
                txn.from = {id:balances_temp[0].user_id,name:balances_temp[0].user_name}
                txn.to = {id:balances_temp[balances_temp.length-1].user_id,name:balances_temp[balances_temp.length-1].user_name}
                txn.amt = Math.abs(balances_temp[balances_temp.length-1].balance);
                balances_temp[balances_temp.length-1].balance = 0;
                balances_temp[0].balance=0;
                $scope.suggestions.push(txn)
            }
            balances_temp = balances_temp.filter(function(x){
                return !(Math.abs(x.balance)<0.01)
            })
        }
    }
    $scope.showActionsheet=function(suggestion){
        $ionicActionSheet.show({
        titleText: 'Settle',
        buttons: [
            { text: '<i class="icon ion-checkmark-circled"></i> Completely' },
            { text: '<i class="icon ion-ios-checkmark-outline"></i> partially' },
        ],
        cancelText: 'Cancel',
        cancel: function() {
            console.log('CANCELLED');
        },
        buttonClicked: function(index) {
            if(index==0)
            {
                $scope.dataforsettlement = suggestion;
                $scope.dataforsettlement.grp =  $scope.group;
                console.log("settle completely"+$scope.dataforsettlement.amt)
                $scope.addsettlement()
            }
            if(index==1)
            {   

                $scope.showpartialsettlementPopup(suggestion);
            }
            
            return true;
        },
        destructiveButtonClicked: function() {
            console.log('DESTRUCT');
            return true;
        }
    });
    };
    $scope.showpartialsettlementPopup = function(suggestion) {
        $scope.popupdata= {}
        var myPopup = $ionicPopup.show({
            template: '<input type="text" ng-model="popupdata.amount">',
            title: 'Enter amount for settlement',
            scope: $scope,
            buttons: [
            { text: '<button class="button-small"><p>cancel</p></button>' },
            { text: '<button class="button-small"><p>settle</p></i>', type: 'button-positive', onTap: function(e) {
                    if (!$scope.popupdata.amount) {
                        //don't allow the user to close unless he enters wifi password
                        e.preventDefault();
                    } else {
                        $scope.dataforsettlement={};
                        $scope.dataforsettlement.from = suggestion.from;
                        $scope.dataforsettlement.to = suggestion.to;
                        $scope.dataforsettlement.amt =  $scope.popupdata.amount;
                        $scope.dataforsettlement.grp =  $scope.group;
                        console.log("settle partially"+$scope.dataforsettlement.amt)
                        $scope.addsettlement()

                    }
                }
            }]
        });
    }
    $scope.addsettlement= function(){
        //console.log($scope.dataforsettlement);
        ExpenseService.addsettlement($scope.dataforsettlement).then(function(){
            $scope.getuserbalances();
            $scope.getsuggestions();
            $scope.doRefresh();
            GroupService.findsettlements($stateParams.groupId).then(function(settlements){
            $scope.settlements= settlements;
            });
        });
        
    }
    $scope.doRefresh = function() {
    
    console.log('Refreshing!');
    $timeout( function() {
      //simulate async response
      $scope.getsuggestions();

      //Stop the ion-refresher from spinning
      $scope.$broadcast('scroll.refreshComplete');
    
    }, 1000);
      
  };
})