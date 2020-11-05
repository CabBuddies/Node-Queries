const BinderNames = {
    QUERY:{
        CHECK:{
            ID_EXISTS:"QUERY_CHECK_ID_EXISTS",
            CAN_READ:"QUERY_CHECK_CAN_READ"
        }
    },
    RESPONSE:{
        CHECK:{
            ID_EXISTS:"RESPONSE_CHECK_ID_EXISTS",
            CAN_READ:"RESPONSE_CHECK_CAN_READ"
        }
    },
    USER:{
        EXTRACT:{
            USER_PROFILES:"USER_EXTRACT_USER_PROFILES"
        }
    },
    USER_RELATION:{
        CHECK:{
            IS_FOLLOWER:"USER_RELATION_CHECK_IS_FOLLOWER"
        }
    }
}

export {
    BinderNames
}