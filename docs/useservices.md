- Buy Airtime
  - Takes in the amount to purchase
  - Takes in the phone number
- Buy Data
  - Available Plans
  - Takes in the available plans and number
- Buy Electricity
  - Takes in the plan, amount and meter number
  - Provides the available Providers
- Buy Cable
  - Available Packages and Providers
  - Takes in the smartcard number.

Buy airtime

- to fetch available options for airtime purchase
  url = http://localhost:7000/api/services/{service-id}/service-categories

// buyairtime transaction endpoint
http://localhost:7000/api/transactions/airtime

Buy data
