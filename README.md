
# Database Modeling

### Requirement for Manager
- List all residnets by apartId -> Get a resident from the list by residentId
- Get apart by apartId
- List all aparts
- List all aparts by building number
- List maintanances which status is open
- List all maintanances by apartId

### Requriement for Resident
- Get resident, apart, maintanances list when login by residentId

### Tables
- Resident
- Apart
- Maintanance


# Server Details
- AWS with Serverless Framework
  (Cognito, DynamoDB, Lamdba, API Gateways, etc.)


# API Details

## Residents APIs

### createResident - /residents
- Use Case
1. Future resident come to the office and fill up all document
2. Manager sign up the new resident with all info on the manager system
3. Resident get verification email with temporary password
4. Resident verify email and login
5. Resident see password change screen right away

- This lambda function gets triggered on No.2
  - On sign up page, there's Apart selection option which shows vacant apart list
  - When manager press sign up button after filling up all resident info

### getResident = /residents/{rid}
- Use Case
1. Resident login their account
  -> Look up their profile

### updateResident - /residents/{rid}
- Use Case
1. Manager update resident information which resident are not allowed to update
  (lease term, ...)
2. Resident move apart -> Manager update apartNum
  (maybe set schedule to change once the new apart is vacant)

### deleteResident - /residents/{rid}
- Use Case
1. When lease ends and balance is 0, system automatically delete resident

Note : only delete from DB, not from user pool

## Aparts APIs

### createApart - /aparts
- Use Case
1. New apartment is built
2. Manager add that apartment in the system


### getApart - /aparts/{aid}
- Use Case
1. Manager look up apartment by entering apart number (apartId)
2. Resident get into their account 
  -> System get the resident's apartId
  -> Get apartment by that apartId

### listAparts - /aparts
- Use Case
1. Manager look up all apartments
  (On Client: Manager can filter by building number)

### updateApart - /aparts/{aid}
- Use Case  
1. Manager update apartment info such as
  floorPlan, rentPrice, announcement

### addResidentInApart - aparts/{aid}/add/{rid}
- Use Case
1. Resident contract lease -> Manager create resident
  -> System automatically update apartment by adding resident in apart

### removeResidentInApart - aparts/{aid}/remove/{rid}
- Use Case
1. Resident lease end and payment balance is 0
  -> Systen automatically update apartment by removing resident from apart

## Maintanances APIs

### createRequest - requests
- Use Case  
1. Resident create maintanance request from website
2. Manager get call from Resident who can't use website
  -> Manager look up that apart -> Create maintanance request for resident



# Notes
- DynamoDB doesn't accept empty string so gave option as below to change empty string to Null
  new AWS.DynamoDB.DocumentClient({
    convertEmptyValues: true
  });

- Debugging order
  1. invoke local
  2. api cli test
  3. client test

- Add error message on response object in order to find out error detail on client side