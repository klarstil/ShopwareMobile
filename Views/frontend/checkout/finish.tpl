{if $sBasketInfo}
{['success'=>false, 'msg'=> 'Ihre Bestellung konnte nicht abgesendet werden. Bitte probieren Sie es zu einen späteren Zeitpunkt erneut.'|utf8_encode]|json_encode}
{else}
{['success'=>true, 'msg'=> 'In Kürze erhalten Sie eine Bestellbestätigungsmail.'|utf8_encode, 'basket'=>$sBasket, 'userdata'=>$sUserData]|json_encode}
{/if}