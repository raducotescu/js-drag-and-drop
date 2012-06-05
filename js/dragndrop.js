/**
 * @author: Radu Cotescu (radu@cotescu.com)
 */

/**
 * This class handles the drag and drop functionalities based on the HTML5 Drag & Drop native API.
 */
function DragAndDropManager()
{

    var request = new AjaxRequest();

    var cssClasses =
    {
        dragstart : "moving",
        dragenter : "over"
    };

    var handlers =
    {
        "dragstart" : function(event)
        {
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setData("text/html", Utils.getOuterHTML(event.target));
            event.target.classList.add(cssClasses.dragstart);
        },
        "dragover" : function(event)
        {
            if(event.preventDefault)
            {
                event.preventDefault();
            }
            event.dataTransfer.dropEffect = "move";
            event.currentTarget.classList.add(cssClasses.dragenter);
            // apparently needed for IE
            return false;
        },
        "dragenter" : function(event)
        {
            event.currentTarget.classList.add(cssClasses.dragenter);
        },
        "dragleave" : function(event)
        {
            Utils.removeClass(event.currentTarget, cssClasses.dragenter);
        },
        "dragend" : function(event)
        {
            Utils.removeClass(event.target, cssClasses.dragstart);
            Utils.removeClass(event.currentTarget, cssClasses.dragenter);
            if(event.dataTransfer.dropEffect !== "none")
            {
                event.target.parentNode.removeChild(event.target);
            }
        },
        "drop" : function(event)
        {
            if(event.stopPropagation)
            {
                event.stopPropagation();
            }
            var dropTarget = event.currentTarget;
            // create a fragment which will be appended to the droppable
            var fragment = document.createDocumentFragment();
            // create a div in which we place the draggable node(s)
            var div = document.createElement("div");
            // store the nodes here so that we can get their properties later
            var nodes = [];
            div.innerHTML = event.dataTransfer.getData("text/html");
            while(div.firstChild)
            {
                var node = div.removeChild(div.firstChild);
                if(node.tagName && node.tagName.toLowerCase() !== "meta")
                {
                    fragment.appendChild(node);
                    nodes.push(node);
                }
            }
            dropTarget.appendChild(fragment);
            // Utils.removeClass(event.target, cssClasses.dragenter);
            Utils.removeClass(dropTarget, cssClasses.dragenter);
            // Utils.removeClass(dropTarget, cssClasses.dragstart);
            var properties = [];
            for(var i = 0; i < nodes.length; i++)
            {
                // get the value for the custom HMTL5 attribute element
                properties.push(nodes[i].dataset["element"]);
            }
            /**
             * create the callback function for the AjaxRequest.send(responseFunction) method
             */
            request.send(function(response)
            {
                console.log("Server: " + response.picard + "; Dropped element " + properties.join(", "));
            });
        }
    };

    /**
     * Returns an event handler from the handlers map by the event's type.
     */
    this.getEventHandler = function(event)
    {
        if(event.type && handlers[event.type])
        {
            return handlers[event.type].call(this, event);
        }
    };
}

/**
 * Marks an element as a droppable zone (a zone on which other elements can be dropped). Event listeners are bound to this element.
 *
 * @param element: the element to be marked as droppable
 * @throws NotANodeException: if the element argument is not a valid DOM node
 */
DragAndDropManager.prototype.addDroppable = function(element)
{
    if(Utils.isNode(element))
    {
        element.addEventListener("dragenter", this.getEventHandler);
        element.addEventListener("dragleave", this.getEventHandler);
        element.addEventListener("dragover", this.getEventHandler);
        element.addEventListener("drop", this.getEventHandler);
    }
    else
    {
        throw new NotANodeException("DragAndDropManager.addDroppable(element) - the supplied element is not a valid DOM node");
    }
};
/**
 * Marks an element as draggable.
 *
 * @param element: the element to be markes as draggable.
 * @throws NotANodeException: if the element argument is not a valid DOM node
 */
DragAndDropManager.prototype.makeDraggable = function(element)
{
    if(Utils.isNode(element))
    {
        var elementTag = element.tagName.toLowerCase();
        if(elementTag !== "img" && elementTag !== "a")
        {
            element.setAttribute("draggable", "true");
        }
    }
    else
    {
        throw new NotANodeException("DragAndDropManager.makeDraggable(element) - the supplied element is not a valid DOM node");
    }
};
/**
 * Marks an element as draggable and binds event listeners to it.
 *
 * @param element: the element to be marked as draggable.
 * @throws NotANodeException: if the element argument is not a valid DOM node
 */
DragAndDropManager.prototype.addDraggable = function(element)
{
    if(Utils.isNode(element))
    {
        this.makeDraggable(element);
        element.addEventListener("dragstart", this.getEventHandler);
        element.addEventListener("dragend", this.getEventHandler);
    }
    else
    {
        throw new NotANodeException("DragAndDropManager.addDraggable(element) - the supplied element is not a valid DOM node");
    }
};
/**
 * Marks the children of an element as draggable and binds event listeners to them.
 *
 * @param element: the parent element whose children will be marked as draggable
 * @throws NotANodeException: if the element argument is not a valid DOM node
 */
DragAndDropManager.prototype.addDraggables = function(element)
{
    if(Utils.isNode(element))
    {
        var children = element.childNodes;
        for(var i = 0; i < children.length; i++)
        {
            if(Utils.isNode(children[i]))
            {
                this.makeDraggable(children[i]);
            }
        }
        element.addEventListener("dragstart", this.getEventHandler);
        element.addEventListener("dragend", this.getEventHandler);
    }
    else
    {
        throw new NotANodeException("DragAndDropManager.addDraggables(element) - the supplied element is not a valid DOM node")
    }
}

/**
 * Helper class that provides useful methods.
 */
function Utils()
{
}

/**
 * Checks if an element is a node or not.
 *
 * @param element: the element to be checked
 * @return: a boolean value (true if the element is a node, false otherwise)
 */
Utils.isNode = function(element)
{
    if(element && element.nodeType)
    {
        if(element.nodeType == 1)
        {
            return true;
        }
    }
    return false;
}
/**
 * Retrieves the outer HTML for an element.
 *
 * @param element: the element for which the outer HTML has to be retrieved
 * @return: a string containing the outer HTML
 */
Utils.getOuterHTML = function(element)
{
    if(element.outerHTML)
    {
        return element.outerHTML;
    }
    else
    {
        var attributes = element.attributes;
        var tag = element.tagName.toLowerCase();
        var html = [];
        html.push(tag);
        for(var i = 0; i < attributes.length; i++)
        {
            html.push(attributes[i].name + '="' + attributes[i].value + '"');
        }
        return "<" + html.join(" ") + ">" + element.innerHTML + "</" + html[0] + ">";
    }
}
/**
 * Removes a class from the list of classes of an element.
 *
 * @param element: the element for which a class should be removed from the class list
 * @param className: the name of the class to be removed
 */
Utils.removeClass = function(element, className)
{
    if(element && className)
    {
        element.classList.remove(className);
        if(element.classList.length == 0)
        {
            element.removeAttribute("class");
        }
    }
}

/**
 * This class defines an AJAX request.
 */
function AjaxRequest()
{
    this.request = new XMLHttpRequest();
    this.url = "startrek.json";
}

/**
 * Sends the asynchronous request to the server and registers a callback function that is called if the request was successful.
 *
 * @param responseFunction: the callback function
 */
AjaxRequest.prototype.send = function(responseFunction)
{
    var me = this;
    if(! typeof responseFunction == "function")
    {
        responseFunction = new Function();
    }
    this.request.onreadystatechange = function()
    {
        if(me.request.readyState == 4)
        {
            if(me.request.status == 200)
            {
                responseFunction.call(this, JSON.parse(me.request.responseText));
            }
            else
            {
                console.log("error processing request");
            }
        }
    }
    this.request.open("post", this.url, true);
    this.request.send();
}