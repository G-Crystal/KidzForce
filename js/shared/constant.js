window.isBrowserMode = true;

angular.module('kb.constant', [])

    .constant('ENDPOINT_LIST', (function () {         
    var web_server = 'http://api.kidzforce.com/v1/';        
    var api_root = '';
    // var web_server = 'http://ec2-107-21-160-8.compute-1.amazonaws.com/app/api/';        
    // var api_root = '';

            
    return {            
                    DOMAIN: web_server + api_root,
                    VERSION: '1.0.0',
                    BUILD: '1.3.0',
                    FBAPPID: '1159778540770974',
                    DOMAIN: web_server,
                    CHILD_CHECK_API: web_server + api_root + 'children/authas',
                    CHILD_NOTIFICATION_RESPOND_API: web_server + api_root + 'children/notification/respond',
                    CHILD_PROFILE_API: web_server + api_root + 'children/profile',
                    PARENT_PROFILE_API: web_server + api_root + 'parent/profile',
                    CHILD_RESUME_UPDATE_API: web_server + api_root + 'children/profile/resume',
                    CHILD_PASSWORD_UPDATE_API: web_server + api_root + 'children/profile/password',
                    CHILD_DELETE_API: web_server + api_root + 'children/profile/delete',
                    CHILD_LOCAL_RESULTS_API: web_server + api_root + 'children/projects/nearme',
                    CHILD_RELOAD_NOTIFICATIONS_API: web_server + api_root + 'children/notifications',
                    PARENT_RELOAD_NOTIFICATIONS_API: web_server + api_root + 'parent/notifications',
                    PROJECT_VIEW_API: web_server + api_root + 'projects/view',
                    PROJECT_APPLY_API: web_server + api_root + 'projects/apply',
                    PROJECT_DELETE_API: web_server + api_root + 'projects/delete',
                    CHILD_REQUEST_DEPOSIT_API: web_server + api_root + 'children/profile/deposit',
                    SIGNUP_VALIDATION_API: web_server + api_root + 'register/validate',
                    REGISTER_SUBMIT_API: web_server + api_root + 'register/add/submit',
                    CHORE_PRESET_API: web_server + api_root + 'projects/popularItems',
                    PROJECT_ADD_VALIDATION_API: web_server + api_root + 'projects/add/validate',
                    PARENT_IDENTITY_STATUS_API: web_server + api_root + 'parent/verified',
                    CHILD_PROJECT_CHECKIN_API: web_server + api_root + 'projects/checkin',
                    PARENT_PROJECTS_API: web_server + api_root + 'projects/list',
                    PARENT_CHILDREN_API: web_server + api_root + 'parent/children',
                    PARENT_PROFILE_UPDATE_API: web_server + api_root + 'profile/update',
                    PARENT_IDENTITY_VERIFY_API: web_server + api_root + 'parent/verify',
                    REGISTER_EMAIL_VALIDATION_API: web_server + api_root + 'register/userexists',
                    REQUEST_HELP_API: web_server + api_root + 'child/request_help',
                    REDEEM_POINTS_API: web_server + api_root + 'child/redeem_points',
                    DELETE_PARENT_CHILD_API: web_server + api_root + 'children/delete',
                    DAILY_DROP_REWARD_API: web_server + api_root + 'child/daily_drop',
                    PREFERENCE_CHANGE_API: web_server + api_root + 'preference/change',
                    CANCEL_PROJECT_API: web_server + api_root + 'projects/quit'


                
    }    
})());
