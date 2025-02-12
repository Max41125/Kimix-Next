import React, {useState, useEffect} from 'react';
import axios from 'axios';
import Loader from '@/app/components/Loaders/Loader';
import { useUser } from '@/app/components/Auth/UserProvider';


const EnglishContract = ({ orderId, currentDate }) => {

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [supplier, setSupplier] = useState(null);
    const { user, token } = useUser() || { user: null, token: null };
    const [products , setProducts] = useState(null);
    const [acceptanceChecked, setAcceptanceChecked] = useState(false);
    const [contractStatus, setContractStatus] = useState('not_filled');

    const [formDataSupplier, setFormDataSupplier] = useState({
        type: '',
        full_name: '',
        short_name: '',
        legal_address: '',
        actual_address: '',
        email: '',
        phone: '',
        inn: '',
        ogrn: '',
        bank_name: '',
        bik: '',
        corr_account: '',
        settlement_account: '',
        okved: '',
        tax_system: '',
        kpp: '',
        ogrn: '',
        director: '',
        chief_accountant: '',
        authorized_person: '',
      });


      const [formDataUser, setFormDataUser] = useState({
        name: '',
        city: '',
        street: '',
        house: '',
        building: '',
        office: '',
        email: '',
        phone: '',
        inn: '',
      });

    






    const csrfUrl = process.env.NEXT_PUBLIC_CSRF_URL;
  
    useEffect(() => {
        if (!user || !token || !orderId) return;
      
        const fetchOrder = async () => {
          try {
            // Fetch CSRF token
            await axios.get(csrfUrl, { withCredentials: true });
      
            // Fetch order details
            const responseOrder = await axios.get(
              `https://test.kimix.space/api/user/order/${orderId}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
                withCredentials: true,
                withXSRFToken: true,
              }
            );
            const dataOrder = responseOrder.data;
            setOrder(dataOrder);
            setProducts(dataOrder.products);
            // Extract supplier ID from the first product (if applicable)
            const firstProduct = dataOrder?.products?.[0];  // Проверяем, есть ли продукт
            const supplierId = firstProduct?.pivot?.supplier_id;
            

            if (supplierId) {
              // Fetch supplier details
              const responseSupplier = await axios.get(
                `https://test.kimix.space/api/seller/${supplierId}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                  withCredentials: true,
                  withXSRFToken: true,
                }
              );
      
              const supplierData = responseSupplier.data;
              setSupplier(supplierData);
      
              if (supplierData) {
                setFormDataSupplier((prevData) => ({
                  ...prevData,
                  ...supplierData,
                }));
              }
            }
      
           
            if (dataOrder?.user?.user_addresses?.length > 0) {
              const userAddress = dataOrder.user.user_addresses[0]; 
              setFormDataUser((prevData) => ({
                ...prevData,
                name: dataOrder.user.name,
                city: userAddress.city,
                street: userAddress.street,
                house: userAddress.house,
                building: userAddress.building,
                office: userAddress.office,
                email: dataOrder.user.email,
                phone: userAddress.phone,
                inn: userAddress.inn,
                buyer_fullname: userAddress.buyer_fullname,
              }));
            }
      
            setLoading(false);
          } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch orders.');
            setLoading(false);
          }
        };
        const fetchContractStatus = async () => {
          try {
            const response = await axios.get(`https://test.kimix.space/api/orders/${orderId}/status`, {
              headers: { Authorization: `Bearer ${token}` },
              withCredentials: true,
              withXSRFToken:true,
            });
            setContractStatus(response.data.status);
          } catch (error) {
            console.error('Ошибка при получении статуса контракта:', error);
          }
        };

        fetchOrder();
        fetchContractStatus();
      }, [orderId, token]);
  
    if (loading) return <Loader/>;
    if (error) return <div>Error: {error}</div>;
    const getCurrencySymbol = (currency) => {
      switch (currency) {
        case 'RUB': return '₽';
        case 'USD': return '$';
        case 'EUR': return '€';
        case 'CNY': return '¥';
        default: return currency;
      }
    };
  
    const translateUnitType = (unitType) => {
      switch (unitType) {
        case 'grams': return 'gr.';
        case 'kilograms': return 'kg.';
        case 'tons': return 't.';
        case 'pieces': return 'thing';
        default: return unitType;
      }
    };

    const handleSubmitContract = async () => {
      try {
        // Проверка на согласие с условиями контракта
        if (!acceptanceChecked) {
          alert('You must confirm that you have read the terms of the contract.');
          return;
        }
    
        // Запрос на CSRF
        await axios.get(csrfUrl, { withCredentials: true });
    
        // Подготовка данных для отправки контракта
        const contractData = {
          order_id: orderId,
          user_id: user.id,
          language: 'en', // или 'en', в зависимости от выбранного языка
        };
    
        // Отправка контракта только для роли 'buyer'
        if (user.role === 'buyer') {
          const contractResponse = await axios.post(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/contract-orders`,
            contractData,
            {
              headers: {
                Authorization: `Bearer ${token}`, // Токен пользователя
                'Content-Type': 'application/json',
              },
              withCredentials: true,
              withXSRFToken: true,
            }
          );
    
          // Проверка успешности отправки контракта
          if (contractResponse.status !== 200) {
            alert('Error sending contract');
            return;
          }
        }
    
        // Изменение статуса заказа в зависимости от роли пользователя
        const statusData = {
          status: user.role === 'buyer' ? 'contract_verification' : 'waiting_payment',
        };
    
        const statusChangeResponse = await axios.patch(
          `https://test.kimix.space/api/orders/${orderId}/status`,
          statusData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            withCredentials: true,
            withXSRFToken: true,
          }
        );
    
        // Проверка ответа на изменение статуса
        if (statusChangeResponse.status === 200) {
          if (user.role === 'buyer') {

            alert('The contract has been sent for review.');
          }else{

            alert('Contract confirmed status changed to "Waiting for payment"');
          }
          
        } else {
          alert('Error changing order status');
        }
      } catch (error) {
        console.error('Error sending contract:', error);
        alert('Error sending contract');
      }
    };

    return (
 
        <div>
            <h1 className='font-bold text-2xl mb-8'>
          
                CONTRACT No. {orderId} dated {currentDate}
            </h1>

            <p>This Contract is concluded between</p>
            <p>
            
            <b>{formDataSupplier.full_name}</b>  located at: <b>{formDataSupplier.legal_address}</b>
           
            </p>

            <p>
                represented by  
                {formDataSupplier.short_name || ''}
                acting under documents of the company, hereinafter referred to as “the Supplier”
            </p>

            <p>and 
                
            {formDataUser.inn ? (

                <b> {formDataUser.buyer_fullname}</b>

                ):(

                <b>{formDataUser.name}</b>

            )}
                ,</p>

            <p>
                located at: 
                
                <b>
                {formDataUser.city && `г. ${formDataUser.city} `}
                {formDataUser.street && `ул. ${formDataUser.street} `}
                {formDataUser.house && `д. ${formDataUser.house} `}
                {formDataUser.building && `стр. ${formDataUser.building} `}
                {formDataUser.office && `оф. ${formDataUser.office}`}
                </b>
                .
            </p>
            <p>
                Represented by <b>{formDataUser.name} </b>,
                the General Director, under documents of
            </p>
        
            <h2>1. SALE AND PURCHASE</h2>
        
            <p>
                1.1. The Parties, in accordance with this Contract, agree on the terms under which the Supplier intends to sell, and the Buyer intends to buy cosmetic raw materials, hereinafter referred to as the &quot;Goods&quot;.
            </p>
            
            <p>
                1.2. The “Goods” means range of products that shall be produced by the Supplier. Description, assortment and price of the Goods as well as quality (ingredient) requirements of the Goods should be confirmed by Parties in the Specification. The agreed Specification is pointed in Appendix 1. 
            </p>
            
            <p>
            1.3. The Supplier shall ship the Goods in export packaging that provides the cargo safety from any damages during transportation by different means of transport.  
            </p>
            
            <h2>2. PRICES AND QUANTITIES</h2>
            
            <p>
                2.1. The Goods are to be delivered in lots in the period of validity of the Contract. The lot, price and the quantity of the Goods of each type, the total price of the lot, shipping period of the delivered Goods, and delivery terms (p.2.2 of this Contract) should be specified in the Specification executed for each delivered lot of the Goods.  
            </p>
            
            <p>
                2.2. The Delivery Terms of the Goods are determined by the Parties in accordance with the International Rules for the Interpretation of Trade Terms (INCOTERMS, 2020). 	
            </p>
            
            <p>
                2.3. The Buyer shall place the Specification on a Company Letterhead completely specifying  ordered Goods, including item numbers, quantity, delivery address, and desirable lead time and send it to the Supplier via electronic mail. 
                The Supplier shall send the Buyer signed Specification, Proforma Invoice via electronic mail not later than 4 calendar days after the date of its receipt from the Buyer.
                Products shall be dispatched within 45 calendar days after оrder placement and confirmed designs by the Supplier.
            </p>
            
            <h2>3. DELIVERY AND PAYMENT</h2>
            
            <p>
                
                3.1. The Goods price is determined in the Specification using EUR and depends on market conditions of cosmetic raw materials and the Delivery Terms which are chosen by the Parties in accordance with the International Rules for the Interpretation of Trade Terms (INCOTERMS 2020). The price of the Goods consignment agreed by the Supplier in the Specification cannot be changed.
                <br/>
                <br/>
                3.2. The Goods price, in addition to the Goods value, also includes: cost of tare (pallets, barrels in which the Goods are packed), and other expenses of the Supplier incurred in proper fulfillment of the obligations under this Contract. In accordance with the current legislation of the Russian Federation, the Buyer shall pay all customs clearance expenses necessary for importation of the Goods into the territory of the Russian Federation, including payment of customs fees and other compulsory payments.
                <br/>
                <br/>
                3.2.1. The total amount of the Contract is determined based on the total amount of all Specifications signed by both Parties under this Contract during the term of its validity. 
                <br/>
                <br/>
                3.2.2. The delivery date shall be a date of transfer of the Goods by Supplier to the forwarder, nominated by the Buyer. The date of transfer of ownership of the Goods is the date of transfer of the Goods by the Supplier to the carrier nominated by the Buyer.	
                <br/>
                <br/>
                3.3. Accordance Proforma Invoice which is issued by the Supplier the payment for the Goods is carried out in the following manner:	
                <br/>
                <br/>
                3.3.1 Payment terms: 50% - at the order placement, 50 % - before the shipment. The payment for the Goods is to be carried out in EUR. Buyer shall pay the bank charges of Buyer’s bank, and Supplier shall pay the bank charges of Suppliers’ bank.	
                <br/>
                <br/>
                3.3.2 In case of impossibility of shipment of Goods which was previously paid by the Buyer, the transferred amount of payment for not shipped Goods have to be returned into the currency account of the Buyer no later than 5 (five) days from the moment of receiving notification from the Recipient sent by e-mail but no later than 100 days after receipt of payment by the Supplier.	
                <br/>
                <br/>
                3.4. The Parties may agree on other Payment Terms that shall be institutionalized by signing additional agreements to the Contract constituting its integral part. 	
                <br/>
                <br/>
                3.5. The Parties may make arrangements into Shipment Terms that shall be institutionalized by signing additional agreements to the Contract constituting its integral part.
                <br/>
                <br/>
                3.6. Quarterly the Parties shall, upon request of the Buyer, perform reconciliation of payments using the form provided by the Buyer  within 10 work days.
                
            </p>
            
            <h2>4. PACKAGING AND MARKING THE GOODS</h2>
            
            <p>
                
                4.1. The Goods packaging shall ensure complete safety of the Goods during transportation and carriage by any means of transport, and during the Goods loading, reloading and unloading.
                <br/>
                <br/>
                4.2. In the event of the Goods damage due to improper packaging, both Parties shall jointly verify the Goods damage cause and agree the compensation amount to be paid by the Supplier, in case the Supplier&quot;s fault is proved.
                <br/>
                <br/>
                4.2.1. The Supplier is not liable for any Goods defects occurred due to improper storage, transportation, loading or unloading performed by the Buyer or the Carrier.
                
            </p>
            
            
            
            <h2>5. QUALITY OF THE GOODS</h2>
            
            <p>
                
                5.1. The quality of the Goods, its composition and other agreed parameters of the Goods must comply with the Specification and Safety Data Sheet (MSDS) (Appendix No. 2 to the Contract), as well as the quality of the previously provided samples. In case of non-compliance of the Goods with the pre-provided samples, and non-compliance with the quality passport (specification) of the Goods, the Buyer has the right to refuse this Goods or demand its replacement with the one corresponding to the provided samples and the quality passport (specification). Poor quality goods should be sent to the supplier. All costs for the return of defective goods are paid by the supplier of the goods.	
                <br/>
                <br/>
                5.2. If the quality of the Goods does not comply with the samples specified in p. 5.1., the Buyer has the right to assert a claim and obtain financial compensation instead of the defective Goods or replacement of the defective Goods with the new ones as may be agreed by the Parties.	
                <br/>
                <br/>
                5.3. Quality of the supplied Goods in addition to complying with the requirements of p. 5.1 of the Contract shall be confirmed by Certificates of Conformity issued in the country of origin of the Goods provided by the Supplier at request of the Buyer.  	
                <br/>
                <br/>
                5.4. The Supplier sets the expiration date for the Goods – 3 months from the date of receipt of the Goods at the Buyer&quot;s warehouse.	
                
            </p>
            
            <h2>6. LIABILITIES OF THE PARTIES</h2>
            
            <p>
                6.1. The Goods shall be accepted according to shipping documents executed in the established manner. The Supplier shall provide the Buyer with the following documents together with each shipment in the period established in this Clause:
                    - Proforma Invoice;
                    - signed Specification;
                    - Packing List (containing information about item numbers, net weight, and number of boxes);
                    - customs declaration;
                    - document confirming the Goods origin before its shipment. 
                    - Draft shipping documents (Packing List) for checking and confirmation of compliance with the Contract Terms via electronic mail when the Goods are ready. The Goods shall consider allowed for shipping only if the Buyer confirmed the shipping documents. 
                <br/>
                <br/>
                6.2. The Buyer shall assert a claim to the Supplier as to quantity, quality (for apparent damages), and assortment of the supplied Goods not later than 10 days from the date of receiving the Goods in the Buyer or the Processor stock subject to delivery terms. If the production or hidden defect is not possible to identify at the moment of receiving the Goods, the claims shall be sent within the Warranty Period set in the clause 5.4. of the  Contract. 
                <br/>
                <br/>
                6.3. In addition to the obligations set out in clause 5.2. of the Contract, the Supplier, at the request of the Buyer, undertakes to reimburse the Buyer&quot;s expenses associated with the supply of low-quality Goods, including all transportation, storage, customs and other costs associated with the supply, disposal of low-quality or non-compliant Goods. The Buyer is obliged to store the Goods to be replaced until the completion of the inspection by the Supplier, but not more than three months from the date of discovery of defects in the Goods, with the right to dispose of it at the end of this period, even if the inspection is not completed.
                <br/>
                <br/>
                6.4. Upon agreement of the Parties, the compensation, in cases specified in the Contract, can be paid to the Buyer, if the Supplier has issued the credit-note with decreased payment amount for the delivered Goods or the advance payment for delivery of the following lot of the Goods. 
                <br/>
                <br/>
                6.5. The Supplier must notify the Buyer in advance of the impossibility of delivering the Goods on time. In this case, the Supplier shall inform the Buyer of the new shipment date. Buyer has the right to confirm a new shipment date, and Buyer can report any inconvenience caused by this delay. At the written request of the Buyer for violation of the delivery time for a period of more than 30 calendar days, the Supplier is obliged to pay the Buyer a penalty in the amount of 2% of the cost of the Goods not delivered on time
                <br/>
                <br/>
                6.6. The Supplier shall, upon request of the Buyer, provide the latter at its expense, in reasonable time, and as far as possible in accordance with the law of country of origin of the Goods, complete assistance in obtaining documents not listed in the Contract or their electronic equivalents, issued by/transferred from the shipment country and/or the country of origin of the Goods, which the Buyer might need to import the Goods or, if required, to transit them through third countries. The Supplier shall, upon request of the Buyer, provide any necessary information for the Goods insurance.
            </p>
            
            
            <h2>7. CONFIDENTIALITY</h2>

            <p>
                7.1. The Parties agree not to use confidential facts or information, obtained while performing the Contract (including information about conclusion of the present Contract), for any purposes without previous written approval of the other Party. Any information shall be considered and treated as confidential, if being declared as confidential by the Parties and related to the terms of the Contract.  
                <br/>
                <br/>
                7.2. The confidentiality obligations shall not apply to open general use information and to information which may be obtained due to circumstances beyond the control of the Parties. Obligations of keeping the information confidential shall not also apply to the providing the information on a legally based demand of any authorized person of an appropriate public agency.
                <br/>
                <br/>
                7.3. The confidentiality obligations shall remain in force both during the validity term of the Contract and upon its termination for any reason.
            </p>
            
            <h2>8. NOTIFICATIONS</h2>
        
            <p>
                8.1. Notifications exchanged between the Parties in accordance with the terms of the Contract shall be rendered via Courier Service, mail, notification letter (registered mail with return receipt) or electronic mail. Any such notification shall be considered delivered after 10 (ten) days from the date of its dispatch via Post or, if being sent off by Courier Service, should be considered received upon handing, or, in case of sending via e-mail to  address, restoration in the Contract within three days after sending.
                <br/>
                <br/>
                8.2. Documents signed by one of the Party and/or by the Parties and rendered by means of electronic communication (including by Email), the Parties consider being the originals with their further submission. Before receiving the originals, the signed copies of documents are obligatory for the Parties.
            </p>
            
            <h2>9. FORCE  MAJEURE</h2>
        
            <p>
                9.1. Should anу circumstances arise which prevent complete or partial fulfillment bу anу of the Parties of their contractual obligations, namely: natural disaster, war, military operations of anу kind, blockade, export or import prohibition, or anу other circumstances beyond the control of the Parties, the time stipulated for the fulfillment of such obligations shall bе extended for the period equal to that during which such circumstances will remain in force. 
                <br/>
                <br/>
                9.2. The Party suffering inability to meet its obligations under the present Contract, shall in 5 (five) working days since the beginning or cessation of the circumstances inform the other Party about the beginning and the cessation of the circumstances preventing the fulfillment of its contractual obligations.
                <br/>
                <br/>
                9.3. Тhе certificates issued bу the respective Chambers of Commerce of the Supplier’s or the Buyer’s countries or other relevant authority or organization of the Party’s country suffering from force-majeure circumstances shall bе sufficient proof of such circumstances and their duration. 
                <br/>
                <br/>
                9.4. Failure to notify or late notification of any force-majeure circumstances deprives the Party of its right to use such circumstances as a basis exempting from responsibility for failure to fulfill its obligations.
                <br/>
                <br/>
                9.5. Should the force-majeure circumstances last for more than 40 days, each Рarty shall have the right to refuse anу further fulfillment of the obligations under the Contract and in such case neither of the Parties shall have the right to make а demand upon the other Party for the compensation of anу possible damages.
            </p>
            
            <h2>10. ARBITRATION AND GOVERNING LAW</h2>
        
            <p>
                10.1. All the disputes resulting from or in connection with the Contract shall be settled through negotiations between the Parties. If the Parties fail to reach an agreement within 30 calendar days from submission of a letter of claim, any dispute that has arisen out of or in connection with this Contract shall be referred for consideration and final settlement to the Moscow Region Commercial Court at 18, Akademika Sakharova str., Moscow, Russian Federation. The Parties agree that the applicable law of the Russian Federation shall be used during the consideration and settlement of the dispute. This Contract shall be governed by the laws of the Russian Federation.
            </p>
            
            
            <h2>11. SPECIAL CONDITIONS</h2>
            
            <p>
                11.1. Аnу amendments and supplements to the present Contract are made in form of Additional Agreements signed bу duly authorized representatives of both Parties. Such amendments and supplements shall be an integral part of the present Contract after being signed. If necessary, the Parties shall provide each other with documents confirming the official status of the legal entity in the country of registration, the powers of the governing body of the legal entity and registration documents confirming the legality of the company in the country of registration.
                <br/>
                <br/>
                11.2. None of the Parties is entitled to transfer its rights and obligations under the present Contract to third parties without written consent of the other Party. The Contract will not be affected even if one or more of the provisions of the Contract will become or admitted invalid.
                <br/>
                <br/>
                11.3. The Contract shall come into force from the moment of its signing by both Parties and be effective within two (2) years from the date of its signing until 2025, January 18 but in any case the present Contract is valid until the Parties fully fulfill their contractual obligations. 
                <br/>
                <br/>
                11.4. The present Contract is made up in English and Russian languages in two counterparts, one copy for each Party. Both English and Russian versions of the present Contract are equivalent and original. In case of any discrepancies found by the Parties in the Contract Russian version will prevail.
            </p>
 

        <table className="mt-6 table-auto border-collapse border border-gray-300 w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2">№</th>
              <th className="border border-gray-300 px-4 py-2">Name</th>
              <th className="border border-gray-300 px-4 py-2">Price per unit excluding VAT</th>
              <th className="border border-gray-300 px-4 py-2">Quantity</th>
              <th className="border border-gray-300 px-4 py-2">Unit of measurement</th>
              <th className="border border-gray-300 px-4 py-2">Amount excluding VAT</th>
            </tr>
          </thead>
          <tbody>
            {products && products.length > 0 ? (
              products.map((product, index) => (
           
                <tr key={product.id} className="text-center">
                  <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
                  <td className="border border-gray-300 px-4 py-2">{product.title}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {product.pivot?.price} {getCurrencySymbol(product.pivot?.currency)}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">{product.pivot?.quantity}</td>
                  <td className="border border-gray-300 px-4 py-2">{translateUnitType(product.pivot?.unit_type)}</td>
                  <td className="border border-gray-300 px-4 py-2">
                  {product.pivot?.quantity && product.pivot?.price 
                  ? (product.pivot.quantity * product.pivot.price).toFixed(2)
                  : '-'} {getCurrencySymbol(product.pivot?.currency)}

                  </td>

                </tr>

               
              ))

            ) : (
              <tr>
                <td colSpan="6" className="border border-gray-300 px-4 py-2 text-center">
                No products found
                </td>
              </tr>
            )}
              <tr className="text-center">
                <td colSpan="5" className="border border-gray-300 px-4 py-2">
                  <b>Total</b>
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {order.total_price} {getCurrencySymbol(order.currency)}
                </td>

              </tr>
          </tbody>
        </table>
        

        <div className='my-6'>
            <h2 className='font-bold text-2xl text-center'>INFORMATION OF THE PARTIES:</h2>

            <div className='flex flex-row justify-between my-6'>

              <div key='seller' className='flex flex-col gap-2 border-gray-300 border-r-2 w-1/2'>

                <p className='font-bold text-xl'>Supplier</p>

                {formDataSupplier.short_name && (
                  <p>
                   {formDataSupplier.short_name}
                  </p>
                )}
                {formDataSupplier.phone && (
                  <p>
                    Phone: <span className="underline">{formDataSupplier.phone}</span>
                  </p>
                )}





                {(formDataSupplier.inn || formDataSupplier.kpp) && (
                  <p>
                    INN/KPP: <span className="underline">
                      {formDataSupplier.inn || ''} {formDataSupplier.kpp && ` / ${formDataSupplier.kpp}`}
                    </span>
                  </p>
                )}

                {formDataSupplier.bank_name && (
                  <p>
                    Name of the bank: <span className="underline">{formDataSupplier.bank_name}</span>
                  </p>
                )}
                {formDataSupplier.bik && (
                  <p>
                    BIC: <span className="underline">{formDataSupplier.bik}</span>
                  </p>
                )}
                {formDataSupplier.corr_account && (
                  <p>
                    Сorr/A: <span className="underline">{formDataSupplier.corr_account}</span>
                  </p>
                )}
                {formDataSupplier.settlement_account && (
                  <p>
                    Curr/A: <span className="underline">{formDataSupplier.settlement_account}</span>
                  </p>
                )}
                {formDataSupplier.okved && (
                  <p>
                    OKVED:: <span className="underline">{formDataSupplier.okved}</span>
                  </p>
                )}
                {formDataSupplier.legal_address && (

                  <p>
                  Address: <span className="underline">{formDataSupplier.legal_address}</span>
                  </p>


                  )}



              </div>

              <div key='buyer' className='flex flex-col gap-2 w-1/2 text-right items-end'>
                <p className='font-bold text-xl'>Buyer</p>

             
              {formDataUser.name && (
                  <p>
                   Full name: <span className="underline">{formDataUser.name}</span>
                  </p>
                )}

              {formDataUser.email && (
                  <p>
                   Email: <span className="underline">{formDataUser.email}</span>
                  </p>
                )}


              {formDataUser.phone && (
                  <p>
                   Phone: <span className="underline">{formDataUser.phone}</span>
                  </p>
                )}
                {formDataUser.inn && (
                  <p>
                   INN: <span className="underline">{formDataUser.inn}</span>
                  </p>
                )}
              {formDataUser.buyer_fullname && (
                  <p>
                   <span className="underline">{formDataUser.buyer_fullname}</span>
                  </p>
                )}

                {formDataUser.phone && (
                  <p>
                  Address:<span className="underline"> {formDataUser.city && `г. ${formDataUser.city} `}
                  {formDataUser.street && `ул. ${formDataUser.street} `}
                  {formDataUser.house && `д. ${formDataUser.house} `}
                  {formDataUser.building && `стр. ${formDataUser.building} `}
                  {formDataUser.office && `оф. ${formDataUser.office}`}</span>
                  </p>
                )}
              </div>


   
            </div>

            {user.role === 'buyer' && contractStatus === 'new' && (
              <div className="mt-6 flex flex-col gap-4 border border-gray-300  p-4 rounded-lg">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="acceptance"
                    onChange={(e) => setAcceptanceChecked(e.target.checked)}
                  />
                  The buyer has read the terms of the contract
                </label>
                <button
                  className={`px-4 py-2 font-bold rounded ${
                    acceptanceChecked
                      ? 'bg-green-500 text-white cursor-pointer'
                      : 'bg-gray-300 text-gray-700 cursor-not-allowed'
                  }`}
                  onClick={handleSubmitContract}
                  disabled={!acceptanceChecked}
                >
                  Submit contract for review
                </button>
              </div>
            )}

            {user.role === 'seller' && contractStatus === 'contract_verification' && (

              <div className="mt-6 flex flex-col gap-4 border border-gray-300  p-4 rounded-lg">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="acceptance"
                    onChange={(e) => setAcceptanceChecked(e.target.checked)}
                  />
                  The seller is familiar with the terms of the contract
                </label>
                <button
                  className={`px-4 py-2 font-bold rounded ${
                    acceptanceChecked
                      ? 'bg-green-500 text-white cursor-pointer'
                      : 'bg-gray-300 text-gray-700 cursor-not-allowed'
                  }`}
                  onClick={handleSubmitContract}
                  disabled={!acceptanceChecked}
                >
                  Confirm contract
                </button>
              </div>
            )}


        </div>

     </div>
    );
};

export default EnglishContract;
