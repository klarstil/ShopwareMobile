{if $error_messages}
{['success'=>false, 'msg'=> 'Ihre Registrierung konnte nicht ausgef&uuml;hrt werden. Bitte prüfen Sie Ihre Eingabe.'|utf8_encode, 'view' => 'checkout/confirm']|json_encode}
{else}
{['success'=>true, 'msg'=> 'Ihre Registrierung war erfolgreich. Klicken Sie auf "Ok" um fortzufahren.'|utf8_encode, 'view' => 'checkout/confirm']|json_encode}
{/if}