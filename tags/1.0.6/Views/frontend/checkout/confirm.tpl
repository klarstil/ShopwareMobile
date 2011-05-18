{if $error_messages}
{['success'=>false, 'msg'=> 'Ihre Registrierung konnte nicht ausgef&uuml;hrt werden. Bitte prüfen Sie Ihre Eingabe.'|utf8_encode, 'view' => 'checkout/confirm']|json_encode}
{else}
{['basketAmount' => $sBasket.Amount|currency, 'amount' => $sAmount|currency, 'shippingCosts' => $sShippingcosts|currency, 'amountWithTaxAlone' => $sAmountWithTax,'amountWithTax' => $sAmountWithTax|currency, 'amountNet' => $sAmountNet|currency, 'shippingCostsDifference' => $sShippingcostsDifference|currency]|json_encode}
{/if}