# Shopware Mobile

* **Version:** Beta2
* **Tag:** 1.2.4
* **Ben&ouml;tigte Shopware Version:** 3.5.4

Shopware Mobile ist ein Plugin f&uuml;r die eCommerce Software "Shopware", welches den Shopbetreiber die M&ouml;glichkeit bietet ein mobiles Template f&uuml;r Kunden mit mobilen Endger&auml;ten wie den Apple iPhone oder den Android basierten Smartphones anzubieten. Das Template basiert auf Sencha Touch 1.0, den ersten HTML5 Mobile Web App Framework.

## Installation

Das Plugin wird wie jedes anderes Shopware Plugin &uuml;ber den integrierten Plugin-Manager installiert. Dazu muss der Inhalt des Verzeichnisses "trunk" in ein eine Struktur gebracht werden. Hierzu legt man einen neuen Ordner mit den Namen "Frontend" an und platziert einen weiteren Ordner mit den Namen "SwagMobileTemplate" in dieses Verzeichnis. Jetzt kopiert man nur noch den Inhalt von "trunk" in den Ordner "SwagMobileTemplate" und zippt den Ordner "Frontend" in ein Zip-Archiv.

Diese Zip-Datei kann jetzt wie &uuml;blich &uuml;ber den Plugin-Manager installiert werden.


## Funktionsumfang

Dieses Plugin bietet ein komplettes Templates, welches auf mobile Endger&auml;te angepasst ist. Die komplette Konfiguration des Plugins kann in einen eigenen Backend-Modul, welches sich unter den Men&uuml;-Punkt "Marketing" liegt, vollzogen werden. Weitere Features sind:

* Mobile Version als Subshop nutzbar
* Registrierung und Login von Kunden
* Unterst&uuml;tzung von Bundles , Varianten-, Konfiguration- und Liveshopping-Artikeln
* vollwertige Suche auf Basis der normalen Suche (keine Lizenz der Intelligenten Suchfunktion ben&uuml;tigt)
* Abgabe von Kommentaren auf der Detailseite
* Unterst&uuml;tzung von Bannern in Unterkategorien
* Einkaufswelten Karussell auf der Startseite
* Tracking von Bestellungen und Registrierungen &uuml;ber einen Subshop
* Dynamische Berechnung des Warenkorbwert

### Geplante Features f&uuml;r die finale Release-Version

* voll anpassbare Startseite
* History-Support
* Detailansicht von Artikeln  im Warenkorb
* Unterst&uuml;tzung der intelligenten Suche
* Unterst&uuml;tzung f&uuml;r Zahlungsanbieter


### Unterst&uuml;tzte Endger&auml;te

* iOS ab Version 3.1.2 (empfohlen iOS 4/iPhone 4)
* Android ab Version 2.2 "Froyo"
* BlackBerry OS ab Version 6 (nicht empfohlen)


## Lizensierung

Shopware Mobile ist wie Sencha Touch unter der GPL v3 Lizenz verf&uuml;gbar. Die genauen Bedingungen k&ouml;nnen Sie in der Datei "LICENSE" nachlesen.

## Weiterentwicklung

Jeder Entwickler ist eingeladen die weitere Entwicklung von Shopware Mobile voran zutreiben. Forkt hierzu einfach das "master"-Branch:

	$ git clone git://github.com/ShopwareAG/ShopwareMobile.git