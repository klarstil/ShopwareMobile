{if $error_messages || $registerErrors}
{['success'=>true, 'msg'=> 'Ihre Registrierung war erfolgreich. Klicken Sie auf "Ok" um fortzufahren.'|utf8_encode, 'view' => 'register/index', 'errors' => $error_messages]|json_encode}
{else}
{['success'=>true, 'msg'=> 'Ihre Registrierung war erfolgreich. Klicken Sie auf "Ok" um fortzufahren.'|utf8_encode,'basketAmount' => $sBasket.Amount|currency, 'amount' => $sAmount|currency, 'shippingCosts' => $sShippingcosts|currency, 'amountWithTaxAlone' => $sAmountWithTax,'amountWithTax' => $sAmountWithTax|currency, 'amountNet' => $sAmountNet|currency, 'shippingCostsDifference' => $sShippingcostsDifference|currency, 'taxRates' => $sBasket.sTaxRates]|json_encode}
{/if}