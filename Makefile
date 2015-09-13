TSC = tsc
TSCFLAGS = -t ES5

BUILDDIR = build
FRONTENDDIR = frontend

F_SOURCES = $(wildcard src/$(FRONTENDDIR)/*.ts)
F_TARGETS = $(BUILDDIR)/$(FRONTENDDIR)/main.js #$(addprefix $(BUILDDIR),$(patsubst src/%.ts,/%.js,$(F_SOURCES)))

main: $(F_TARGETS) server
	@echo $<

$(F_TARGETS): $(F_SOURCES)
	mkdir -p $(BUILDDIR)/$(FRONTENDDIR)
	$(TSC) $(TSCFLAGS) --out $@ $(F_SOURCES)
	cp src/$(FRONTENDDIR)/*.html $(BUILDDIR)/$(FRONTENDDIR)/

server:
	cp src/server.py $(BUILDDIR)/

clean:
	rm -rf $(BUILDDIR)

