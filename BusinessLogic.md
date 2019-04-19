# Lease Change

## 1. Early Move Out (Do after resident sign it)
- if moveOutDate is earlier than leaseEndDate
  -> broke contract fee : + 1 month rent price
- if moveOutDate is later than two months from now
  -> nothing to do
- if moveOutDate is earlier than two months from now
  -> remaining payment balance is two months rent price


## 2. If resident do nothing when it's already passed two months before move out date (= lease end date)
- Automatically adjust move out date to two months later from today
  (ex. leaseEndDate 6/1, today 4/2 => update moveOutDate to 6/2)

  ### Logic (Function that triggers everyday)
  - Loop through all aparts and check below for each apart
  - moveOutConfirmed is false && (moveOutDate < (today + 60))
      - YES (Didn't sign for move out and less than 60 days to move out date) : 

          On 5/1, resident come to office and say, 
          "I need to move out on 6/1 which I was supposed to move out.
          I was traveling overseas so couldn't see any notice from you guys."
          and office says,
          "Ok, you can do that but 60 days notice rule already applied
          on the system. we tried to reach you via email, phone 
          and left note at your door to notify you.
          It's your fault not responded to that.
          Thus, whenever you move out, you need to pay until 7/1 
          which is 60 days from today.
          I'll update your moveOutDtate to 7/1.
          You will be deleted from the system if your payment balance is 0 on 7/1"

        - Manager action
          1. Click "Move Out" button
          2. Set date to 7/1
          3. Update
        - Logic
          1. moveOutDate get updated to 7/1
          2. moveOutConfirmed = true (now it no longer changes)
      
      - NO (Signed for move out or not reached 60 days to move out days) : 
      
        Do nothing

## 3. Renew (Do after resident sign it)
- Show modal with one input field (number between 6-12)
- Message : "Please enter Renew in below text field to proceed.
This cannot be undone.
- Submit with new leaseTerm
- Update apart db : leaseTerm, leaseStartDate, leaseEndDate


# Payment
## What queries are needed?
- 

## Payment DB Properties
- apartId (PK)
- transactionTime (SK)
- title : what is this transaction about
- charge : amount that apart requested resident to pay
- payment : amount that resident paid
- balance : total money that resident needs to pay or resident has
  (ex. balance $100 : resident needs to pay $100 / balance -$100 : resident has $100 in the account so when apart charges something, resident can pay with that money)

## Apart DB Properties which need to add for payment
- account {
  name : S,
  routingNum : S,
  accountNum : S,
  accountType : S (Checking or Savings)
}
- card { 
  name : S,
  number : S,
  month : S,
  year : S,
  billingAddress {
    street : S,
    apt : S,
    city : S,
    state : S,
    zipcode : S
  }
}
- autoPay {
  enabled : B,
  startDate : S,
  endDate : S,
  payOnDay : S,
  autoPayAccount : {} (account or card)
}

## Factors that causes balance changes
- Rent that charges every month (first and last month rate are prorated)
- Early move out : add one month rent
- Move out less than 60 days from today : add prorated value for the rest days (ex. move out 40 days from today : pay extra for 20 days which is 30 x 20 = 600)
- Late payment : add $50 if not paid until 5th
- Late payment : add $10 everyday from 7th (pay on 10th : 50 + 10 + 10 + 10 + 10 = 90)

### 1. Resident moves in and the first month payment is prorated
- move in date : 10th
- rent price : $900
- 1 day prorated value : 900 / 30 = 30 (divide by 30 on whatever months for convinience
- So first month payment is $300
- Payment is updated 