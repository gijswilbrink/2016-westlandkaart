# westlandkaart
Voor het Westland maakten we in samenwerking met Mapping History een Google Maps kaart waarin je door de tijd kunt reizen. Op http://www.westlandkaart.nl/ vind je de werkende versie, waarin je met het hamburgermenu rechtsboven een thema kunt kiezen. Vervolgens kun je in het jaarmenu een ander jaar kiezen, waarin je ziet hoe het Westland er in die tijd uitzag.

Het is een **single page app** geworden met eigen JavaScript models, inclusief een microtemplating system. In deze repository heb ik alleen de bestanden toegevoegd waar ik zelf aan heb gewerkt:

- In *src/js* vind je de JavaScript classes. *app.js* is de main class, die alle acties afvangt en bij elke gevraagde nieuwe URL een ajax request uitvoert en de history manipuleert zodat de app geen page refreshes nodig heeft
- In *od/classes/control/class-getjsondata.php* vind je de PHP controller die de ajax request opvangt, de juiste content zoekt, plus de bijbehorende markers voor op de kaart, en vervolgens alles als JSON teruggeeft
- Omdat de PHP controller bij de requests gebruik maakt van de standaard permalinks in WordPress, is iedere pagina ook door de server te renderen en kan de hele app dus ook zonder ajax gebruikt worden. Dit is een techniek die ik vaker toepas als ik niet met een JS framework als React of Angular werk: ik zorg dat de applicatie ook met pagerefreshes werkt en de routing via normale links gebeurt, om vervolgens een extra Ajaxlaag toe te passen. Door deze progressive enhancements zijn de site optimaal doorzoekbaar en werken ze het best op oudere systemen.
- De *snippet-...* bestanden zijn kleine templates waarmee verschillende delen van de pagina's worden gerenderd. Ik houd deze templates het liefst zo 'dom' mogelijk, en stop alle logica in de models, zodat het templatesysteem ook makkelijk te vervangen is door een JavaScript templating systeem
- De JavaScript-app gebruikt ook enkele JavaScript templates, deze zijn te herkennen aan de *js-...* bestanden
- Mijn models voor markers, pagina's, taxonomieën en thema's vind je in *od/classes*. Ze werken met mijn OD WordPress MVC systeem, die ook te vinden is mijn github.
